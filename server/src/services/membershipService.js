/**
 * membershipService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Shared business logic for the membership / investor journey, used by both the
 * admin controller (approvals) and the cron (lapse pass). Keeping it here avoids
 * duplicating the role-transition and installment-generation rules.
 */

const Membership         = require("../models/Membership");
const InvestmentLedger   = require("../models/InvestmentLedger");
const InvestmentSettings = require("../models/InvestmentSettings");
const User               = require("../models/User");
const {
  TOTAL_TARGET,
  INSTALLMENT_AMOUNT,
  SHARE_UNIT,
  MEMBER_WINDOW_MONTHS,
} = require("../config/investmentConstants");

// Elevated roles mirror adminController — when present, the base "user" role is stripped.
const ELEVATED_ROLES = [
  "admin", "seller", "customer", "Director", "GM", "AGM",
  "Accountant", "DataEntry", "Management", "member", "Investor",
];

/**
 * The sequential confirmation pipeline. Each stage moves a ledger entry from its
 * `input` status to `output`, logging the staff member under `auditKey`.
 *   Pending → AccountantConfirmed → DataEntryConfirmed → Paid
 */
const STAGE = {
  accountant: { input: "Pending",             output: "AccountantConfirmed", auditKey: "accountant" },
  dataEntry:  { input: "AccountantConfirmed", output: "DataEntryConfirmed",  auditKey: "dataEntry"  },
  management: { input: "DataEntryConfirmed",  output: "Paid",                auditKey: "management" },
};

/** Add a role to a user doc (in memory); strip "user" when any elevated role is present. */
const addRole = (user, role) => {
  const roles = new Set(user.roles || []);
  roles.add(role);
  let next = [...roles];
  if (next.some((r) => ELEVATED_ROLES.includes(r))) {
    next = next.filter((r) => r !== "user");
  }
  if (next.length === 0) next = ["user"];
  user.roles = next;
};

/** Remove a role from a user doc (in memory); fall back to ["user"] when nothing elevated remains. */
const removeRole = (user, role) => {
  let next = (user.roles || []).filter((r) => r !== role);
  const hasElevated = next.some((r) => ELEVATED_ROLES.includes(r));
  if (!hasElevated) next = ["user"];
  if (next.length === 0) next = ["user"];
  user.roles = next;
};

/** Add N calendar months to a date. */
const addMonths = (date, months) => {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
};

/** Number of days in the given (year, monthIndex) — monthIndex is 0-based. */
const daysInMonth = (year, monthIndex) => new Date(year, monthIndex + 1, 0).getDate();

/**
 * Due date for an installment: take the base date, advance `monthOffset` months,
 * and pin it to the admin-controlled `dueDay` (clamped to the month's length so
 * e.g. day 31 in February becomes the 28th/29th).
 */
const computeInstallmentDueDate = (baseDate, monthOffset, dueDay) => {
  const base = new Date(baseDate);
  const year = base.getFullYear();
  const monthIndex = base.getMonth() + monthOffset;
  // Normalise year/month overflow via a throwaway date.
  const norm = new Date(year, monthIndex, 1);
  const day = Math.min(dueDay, daysInMonth(norm.getFullYear(), norm.getMonth()));
  return new Date(norm.getFullYear(), norm.getMonth(), day);
};

/**
 * Recompute cached totals on a membership from its Paid ledger entries.
 * Mutates the membership in memory (does NOT save).
 */
const recomputeTotals = async (membership) => {
  const paid = await InvestmentLedger.find({
    membershipId: membership._id,
    status: "Paid",
  }).select("amount");

  const total = paid.reduce((sum, e) => sum + (e.amount || 0), 0);
  membership.totalApprovedPaid = total;
  membership.shares = Math.floor(total / SHARE_UNIT);
  return total;
};

/**
 * Generate all installment ledger entries at once, starting one month after the
 * given completion date. Idempotent via membership.installmentsGenerated.
 */
const generateInstallments = async (membership, completedAt) => {
  if (membership.installmentsGenerated) return [];

  const remaining = Math.max(0, TOTAL_TARGET - (membership.downPaymentAmount || 0));
  if (remaining <= 0) {
    membership.installmentsGenerated = true;
    return [];
  }

  // Month/year auto-advance per installment; the day-of-month is the global,
  // admin-controlled setting (applies to every investor).
  const { installmentDueDay } = await InvestmentSettings.getSettings();

  const count = Math.ceil(remaining / INSTALLMENT_AMOUNT);
  const docs = [];
  for (let i = 0; i < count; i++) {
    const isLast = i === count - 1;
    const amount = isLast
      ? remaining - INSTALLMENT_AMOUNT * (count - 1)
      : INSTALLMENT_AMOUNT;

    docs.push({
      membershipId: membership._id,
      userId: membership.userId,
      type: "installment",
      installmentNumber: i + 1,
      amount,
      dueDate: computeInstallmentDueDate(completedAt, i + 1, installmentDueDay),
      status: "Unpaid",
    });
  }

  const created = await InvestmentLedger.insertMany(docs);
  membership.installmentsGenerated = true;
  return created;
};

/**
 * Re-pin every installment's due date to a new global day-of-month, keeping each
 * entry's existing month & year (only the day changes). Applied to ALL investors
 * when the admin updates the global due day. Returns the number updated.
 */
const applyDueDayToAllInstallments = async (dueDay) => {
  const installments = await InvestmentLedger.find({ type: "installment" }).select(
    "_id dueDate"
  );

  const ops = installments.map((inst) => {
    const d = inst.dueDate ? new Date(inst.dueDate) : new Date();
    const day = Math.min(dueDay, daysInMonth(d.getFullYear(), d.getMonth()));
    const newDue = new Date(d.getFullYear(), d.getMonth(), day);
    return {
      updateOne: {
        filter: { _id: inst._id },
        update: { $set: { dueDate: newDue } },
      },
    };
  });

  if (ops.length) await InvestmentLedger.bulkWrite(ops);
  return ops.length;
};

/**
 * Final step — mark a ledger entry Paid (Management confirmation) and apply every
 * side effect:
 *   - mark entry Paid + log management audit
 *   - recompute membership totals & shares
 *   - booking      → become member (+role, +6-month deadline)
 *   - downpayment  → become investor (swap role, generate installments)
 *
 * Saves the entry, membership, and user. Returns { entry, membership }.
 * Used by the Management stage and by admin auto-approve (createBookingForUser).
 */
const finalizeEntry = async (entry, staffId) => {
  const membership = await Membership.findById(entry.membershipId);
  if (!membership) throw new Error("Membership not found for ledger entry.");

  const now = new Date();

  // 1. Mark the entry paid + record the management confirmation
  entry.status = "Paid";
  entry.audit = entry.audit || {};
  entry.audit.management = { by: staffId || null, at: now };
  await entry.save();

  // 2. Stage transitions
  const user = await User.findById(membership.userId);

  if (entry.type === "booking" && membership.status === "pending_booking") {
    membership.status = "member";
    membership.becameMemberAt = now;
    membership.memberDeadline = addMonths(now, MEMBER_WINDOW_MONTHS);
    if (user) {
      addRole(user, "member");
      await user.save();
    }
  } else if (entry.type === "downpayment" && membership.status === "member") {
    membership.status = "investor";
    membership.downPaymentCompletedAt = now;
    if (user) {
      removeRole(user, "member");
      addRole(user, "Investor");
      await user.save();
    }
    await generateInstallments(membership, now);
  }

  // 3. Recompute cached totals & shares, then save
  await recomputeTotals(membership);
  await membership.save();

  return { entry, membership };
};

/**
 * Advance one ledger entry through a single confirmation stage. Validates that
 * the entry is at the expected input status, logs the staff member in the audit
 * trail, and either moves to the next status or finalizes (Management stage).
 * Throws on an invalid stage transition. Returns { entry, membership? }.
 */
const advanceLedgerEntry = async (entry, stageKey, staffId) => {
  const stage = STAGE[stageKey];
  if (!stage) throw new Error("Unknown confirmation stage.");

  if (entry.status !== stage.input) {
    throw new Error("This payment is not awaiting confirmation at this stage.");
  }

  if (stage.output === "Paid") {
    return finalizeEntry(entry, staffId);
  }

  entry.audit = entry.audit || {};
  entry.audit[stage.auditKey] = { by: staffId || null, at: new Date() };
  entry.status = stage.output;
  await entry.save();
  return { entry };
};

/**
 * Lapse pass — revoke membership from members who missed the downpayment window.
 * Returns the number of memberships lapsed.
 */
const lapseExpiredMembers = async () => {
  const now = new Date();
  const expired = await Membership.find({
    status: "member",
    downPaymentCompletedAt: null,
    memberDeadline: { $lt: now },
  });

  let count = 0;
  for (const membership of expired) {
    membership.status = "lapsed";
    await membership.save();

    const user = await User.findById(membership.userId);
    if (user) {
      removeRole(user, "member");
      await user.save();
    }
    count++;
  }
  return count;
};

module.exports = {
  addRole,
  removeRole,
  addMonths,
  computeInstallmentDueDate,
  recomputeTotals,
  generateInstallments,
  applyDueDayToAllInstallments,
  STAGE,
  advanceLedgerEntry,
  finalizeEntry,
  lapseExpiredMembers,
};
