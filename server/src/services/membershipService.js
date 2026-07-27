const membershipRepository = require("../repositories/MembershipRepository");
const investmentLedgerRepository = require("../repositories/InvestmentLedgerRepository");
const investmentSettingRepository = require("../repositories/InvestmentSettingRepository");
const userRepository = require("../repositories/UserRepository");
const apartmentUnitRepository = require("../repositories/ApartmentUnitRepository");
const { withGeneratedIds } = require("../utils/dbUtils");
const {
  TOTAL_TARGET,
  INSTALLMENT_AMOUNT,
  SHARE_UNIT,
  MEMBER_WINDOW_MONTHS,
} = require("../config/investmentConstants");

const ELEVATED_ROLES = [
  "admin", "seller", "customer", "Director", "GM", "AGM",
  "Accountant", "DataEntry", "Management", "member", "Investor",
];

const STAGE = {
  accountant: { input: "Pending",             output: "AccountantConfirmed", auditKey: "accountant" },
  dataEntry:  { input: "AccountantConfirmed", output: "DataEntryConfirmed",  auditKey: "dataEntry"  },
  management: { input: "DataEntryConfirmed",  output: "Paid",                auditKey: "management" },
};

const addRole = (user, role) => {
  const roles = new Set(user.roles || []);
  roles.add(role);
  let next = [...roles];
  if (next.some((r) => ELEVATED_ROLES.includes(r))) {
    next = next.filter((r) => r !== "user");
  }
  if (next.length === 0) next = ["user"];
  user.roles = next;
  return next;
};

const removeRole = (user, role) => {
  let next = (user.roles || []).filter((r) => r !== role);
  const hasElevated = next.some((r) => ELEVATED_ROLES.includes(r));
  if (!hasElevated) next = ["user"];
  if (next.length === 0) next = ["user"];
  user.roles = next;
  return next;
};

const addMonths = (date, months) => {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
};

const daysInMonth = (year, monthIndex) => new Date(year, monthIndex + 1, 0).getDate();

const computeInstallmentDueDate = (baseDate, monthOffset, dueDay) => {
  const base = new Date(baseDate);
  const year = base.getFullYear();
  const monthIndex = base.getMonth() + monthOffset;
  const norm = new Date(year, monthIndex, 1);
  const day = Math.min(dueDay, daysInMonth(norm.getFullYear(), norm.getMonth()));
  return new Date(norm.getFullYear(), norm.getMonth(), day);
};

const recomputeTotals = async (membership) => {
  const paid = await investmentLedgerRepository.db('investment_ledgers')
    .where({ membership_id: membership.id, status: "Paid" })
    .select("amount");

  const total = paid.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  membership.total_approved_paid = total;
  membership.shares = Math.floor(total / SHARE_UNIT);
  
  await membershipRepository.update(membership.id, {
      total_approved_paid: total,
      shares: membership.shares
  });
  
  return total;
};

const generateInstallments = async (membership, completedAt) => {
  if (membership.installments_generated) return [];

  const remaining = Math.max(
    0,
    TOTAL_TARGET - (Number(membership.booking_money) || 0) - (Number(membership.down_payment_amount) || 0)
  );
  if (remaining <= 0) {
    await membershipRepository.update(membership.id, { installments_generated: true });
    return [];
  }

  const settingsDoc = await investmentSettingRepository.findByKey('installment_due_day') || { value: { installmentDueDay: 10 } };
  const installmentDueDay = settingsDoc.value?.installmentDueDay || 10;

  const SPECIAL_INSTALLMENT_AMOUNT = 500000;
  let currentRemaining = remaining;
  let currentInstallmentNumber = 1;
  const docs = [];

  
  for (let i = 0; i < 2; i++) {
    if (currentRemaining <= 0) break;
    const amount = Math.min(SPECIAL_INSTALLMENT_AMOUNT, currentRemaining);
    docs.push({
      membership_id: membership.id,
      user_id: membership.user_id,
      property_id: membership.property_id || null,
      type: "installment",
      installment_number: currentInstallmentNumber,
      amount,
      due_date: computeInstallmentDueDate(completedAt, currentInstallmentNumber - 1, installmentDueDay),
      status: "Unpaid",
    });
    currentRemaining -= amount;
    currentInstallmentNumber++;
  }

  
  if (currentRemaining > 0) {
    const count = Math.ceil(currentRemaining / INSTALLMENT_AMOUNT);
    for (let i = 0; i < count; i++) {
      const isLast = i === count - 1;
      const amount = isLast
        ? currentRemaining - INSTALLMENT_AMOUNT * (count - 1)
        : INSTALLMENT_AMOUNT;

      docs.push({
        membership_id: membership.id,
        user_id: membership.user_id,
        property_id: membership.property_id || null,
        type: "installment",
        installment_number: currentInstallmentNumber,
        amount,
        due_date: computeInstallmentDueDate(completedAt, currentInstallmentNumber - 1, installmentDueDay),
        status: "Unpaid",
      });
      currentInstallmentNumber++;
    }
  }

  const docsWithIds = withGeneratedIds(docs);
  await investmentLedgerRepository.db('investment_ledgers').insert(docsWithIds);
  const created = await investmentLedgerRepository.db('investment_ledgers')
    .whereIn('id', docsWithIds.map((doc) => doc.id));
  await membershipRepository.update(membership.id, { installments_generated: true });
  return created;
};

const applyDueDayToAllInstallments = async (dueDay) => {
  const installments = await investmentLedgerRepository.db('investment_ledgers')
    .where({ type: "installment" })
    .select("id", "due_date");

  let updatedCount = 0;
  
  for (const inst of installments) {
    const d = inst.due_date ? new Date(inst.due_date) : new Date();
    const day = Math.min(dueDay, daysInMonth(d.getFullYear(), d.getMonth()));
    const newDue = new Date(d.getFullYear(), d.getMonth(), day);
    
    await investmentLedgerRepository.update(inst.id, { due_date: newDue });
    updatedCount++;
  }

  return updatedCount;
};

const finalizeEntry = async (entry, staffId) => {
  const membership = await membershipRepository.findById(entry.membership_id);
  if (!membership) throw new Error("Membership not found for ledger entry.");

  const now = new Date();

  const audit = entry.audit || {};
  audit.management = { by: staffId || null, at: now };
  
  await investmentLedgerRepository.update(entry.id, { 
      status: "Paid", 
      audit: audit 
  });
  
  entry.status = "Paid";
  entry.audit = audit;

  const user = await userRepository.findById(membership.user_id);

  if (entry.type === "booking" && membership.status === "pending_booking") {
    const updates = {
        status: "member",
        became_member_at: now,
        member_deadline: addMonths(now, MEMBER_WINDOW_MONTHS)
    };
    Object.assign(membership, updates);
    await membershipRepository.update(membership.id, updates);

    if (user) {
      const newRoles = addRole(user, "member");
      await userRepository.update(user.id, { roles: newRoles });
    }
    if (membership.unit_id) {
      const unit = await apartmentUnitRepository.findById(membership.unit_id);
      if (unit && unit.status === "Unsold") {
        await apartmentUnitRepository.update(unit.id, {
            status: "Booked",
            allocated_to: membership.user_id,
            allocated_by: staffId || null,
            allocated_at: now
        });
      }
    }
  } else if (entry.type === "downpayment" && membership.status === "member") {
    const updates = {
        status: "investor",
        down_payment_completed_at: now
    };
    Object.assign(membership, updates);
    await membershipRepository.update(membership.id, updates);

    if (user) {
      const otherMemberCountRecord = await membershipRepository.db('memberships')
        .where({ user_id: membership.user_id, status: "member" })
        .whereNot({ id: membership.id })
        .count('id as count').first();
      
      const otherMemberCount = parseInt(otherMemberCountRecord.count, 10);
      if (otherMemberCount === 0) {
        removeRole(user, "member");
      }
      const newRoles = addRole(user, "Investor");
      await userRepository.update(user.id, { roles: newRoles });
    }
    if (membership.unit_id) {
      const unit = await apartmentUnitRepository.findById(membership.unit_id);
      if (unit && unit.status === "Booked" && String(unit.allocated_to) === String(membership.user_id)) {
        await apartmentUnitRepository.update(unit.id, { status: "Sold" });
      }
    }
    await generateInstallments(membership, now);
  }

  await recomputeTotals(membership);

  return { entry, membership };
};

const advanceLedgerEntry = async (entry, stageKey, staffId) => {
  const stage = STAGE[stageKey];
  if (!stage) throw new Error("Unknown confirmation stage.");

  if (entry.status !== stage.input) {
    throw new Error("This payment is not awaiting confirmation at this stage.");
  }

  if (stage.output === "Paid") {
    return finalizeEntry(entry, staffId);
  }

  const audit = entry.audit || {};
  audit[stage.auditKey] = { by: staffId || null, at: new Date() };
  
  const updatedEntry = await investmentLedgerRepository.update(entry.id, {
      status: stage.output,
      audit: audit
  });

  return { entry: updatedEntry };
};

const lapseExpiredMembers = async () => {
  const now = new Date();
  const expired = await membershipRepository.db('memberships')
    .where({ status: "member" })
    .whereNull('down_payment_completed_at')
    .andWhere('member_deadline', '<', now);

  let count = 0;
  for (const membership of expired) {
    await membershipRepository.update(membership.id, { status: "lapsed" });

    const user = await userRepository.findById(membership.user_id);
    if (user) {
      const otherActiveCountRecord = await membershipRepository.db('memberships')
        .where({ user_id: membership.user_id })
        .whereIn('status', ["member", "investor"])
        .whereNot({ id: membership.id })
        .count('id as count').first();
        
      const otherActiveCount = parseInt(otherActiveCountRecord.count, 10);
      if (otherActiveCount === 0) {
        const newRoles = removeRole(user, "member");
        await userRepository.update(user.id, { roles: newRoles });
      }
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
