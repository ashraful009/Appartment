const Membership       = require("../models/Membership");
const InvestmentLedger = require("../models/InvestmentLedger");
const ApartmentUnit    = require("../models/ApartmentUnit");
const { advanceLedgerEntry, STAGE } = require("../services/membershipService");

const USER_FIELDS = "name email phone profilePhoto";
const AUDIT_POPULATE = [
  { path: "audit.accountant.by", select: "name" },
  { path: "audit.dataEntry.by", select: "name" },
  { path: "audit.management.by", select: "name" },
];
const IN_PROGRESS = ["Pending", "AccountantConfirmed", "DataEntryConfirmed"];

// ─────────────────────────────────────────────────────────────────────────────
// Stage handler factory — produces the four endpoints for one pipeline stage
// (accountant | dataEntry | management). Each stage only sees entries at its own
// input status and advances them to the next.
// ─────────────────────────────────────────────────────────────────────────────
const makeStageHandlers = (stageKey) => {
  const inputStatus = STAGE[stageKey].input;

  const getPending = async (req, res) => {
    try {
      const entries = await InvestmentLedger.find({ status: inputStatus })
        .populate("userId", USER_FIELDS)
        .populate(AUDIT_POPULATE)
        .sort({ submittedAt: 1, createdAt: 1 });
      res.status(200).json(entries);
    } catch (error) {
      console.error(`getPending(${stageKey}) error:`, error);
      res.status(500).json({ message: "Server error fetching pending payments." });
    }
  };

  const confirm = async (req, res) => {
    try {
      const entry = await InvestmentLedger.findById(req.params.id);
      if (!entry) return res.status(404).json({ message: "Payment entry not found." });

      try {
        await advanceLedgerEntry(entry, stageKey, req.user._id);
      } catch (e) {
        return res.status(400).json({ message: e.message });
      }

      const populated = await InvestmentLedger.findById(entry._id)
        .populate("userId", USER_FIELDS)
        .populate(AUDIT_POPULATE);
      res.status(200).json({ message: "Payment confirmed.", entry: populated });
    } catch (error) {
      console.error(`confirm(${stageKey}) error:`, error);
      res.status(500).json({ message: "Server error confirming payment." });
    }
  };

  const confirmBatch = async (req, res) => {
    try {
      const entries = await InvestmentLedger.find({
        batchId: req.params.batchId,
        status: inputStatus,
      });
      if (entries.length === 0) {
        return res.status(404).json({ message: "No payments awaiting confirmation in this batch." });
      }
      for (const entry of entries) {
        await advanceLedgerEntry(entry, stageKey, req.user._id);
      }
      res.status(200).json({ message: `Confirmed ${entries.length} payment(s).` });
    } catch (error) {
      console.error(`confirmBatch(${stageKey}) error:`, error);
      res.status(500).json({ message: "Server error confirming batch." });
    }
  };

  const reject = async (req, res) => {
    try {
      const entry = await InvestmentLedger.findById(req.params.id);
      if (!entry) return res.status(404).json({ message: "Payment entry not found." });
      if (entry.status === "Paid") {
        return res.status(400).json({ message: "Cannot reject an already-completed payment." });
      }

      entry.status = "Unpaid";
      entry.paymentMethod = null;
      entry.paymentDetails = {};
      entry.invoiceUrl = "";
      entry.description = "";
      entry.batchId = null;
      entry.submittedAt = null;
      entry.audit = { accountant: {}, dataEntry: {}, management: {} };
      await entry.save();

      res.status(200).json({ message: "Payment rejected and returned to the user.", entry });
    } catch (error) {
      console.error(`reject(${stageKey}) error:`, error);
      res.status(500).json({ message: "Server error rejecting payment." });
    }
  };

  return { getPending, confirm, confirmBatch, reject };
};

// ─────────────────────────────────────────────────────────────────────────────
// Member stats — shared across all staff panels.
// ─────────────────────────────────────────────────────────────────────────────
const computeStats = (ledger, now = new Date()) => {
  const installments = ledger.filter((e) => e.type === "installment");
  const paid = ledger.filter((e) => e.status === "Paid");

  const lastPaymentDate = paid
    .map((e) => e.audit?.management?.at || e.submittedAt || e.updatedAt)
    .filter(Boolean)
    .sort((a, b) => new Date(b) - new Date(a))[0] || null;

  const unpaidInstallments = installments.filter((e) => e.status === "Unpaid");
  const nextDueDate = unpaidInstallments
    .map((e) => e.dueDate)
    .filter(Boolean)
    .sort((a, b) => new Date(a) - new Date(b))[0] || null;

  return {
    installmentsTotal:     installments.length,
    installmentsPaidCount: installments.filter((e) => e.status === "Paid").length,
    installmentsRemaining: installments.filter((e) => e.status !== "Paid").length,
    overdueCount:          unpaidInstallments.filter(
      (e) => e.dueDate && new Date(e.dueDate) < now
    ).length,
    inProgressCount:       ledger.filter((e) => IN_PROGRESS.includes(e.status)).length,
    lastPaymentDate,
    nextDueDate,
  };
};

const getMembers = async (req, res) => {
  try {
    const memberships = await Membership.find({
      status: { $in: ["member", "investor"] },
    }).populate("userId", USER_FIELDS);

    const ids = memberships.map((m) => m._id);
    const ledger = await InvestmentLedger.find({ membershipId: { $in: ids } });

    const byMembership = {};
    for (const e of ledger) {
      const key = e.membershipId.toString();
      (byMembership[key] ||= []).push(e);
    }

    const now = new Date();
    const result = memberships.map((m) => ({
      _id: m._id,
      userId: m.userId,
      status: m.status,
      shares: m.shares,
      totalApprovedPaid: m.totalApprovedPaid,
      ...computeStats(byMembership[m._id.toString()] || [], now),
    }));

    result.sort((a, b) => b.overdueCount - a.overdueCount);
    res.status(200).json(result);
  } catch (error) {
    console.error("getMembers error:", error);
    res.status(500).json({ message: "Server error fetching members." });
  }
};

const getMemberProfile = async (req, res) => {
  try {
    const membership = await Membership.findOne({
      userId: req.params.userId,
    }).populate("userId", USER_FIELDS);
    if (!membership) return res.status(404).json({ message: "Membership not found." });

    const ledger = await InvestmentLedger.find({ membershipId: membership._id })
      .populate(AUDIT_POPULATE)
      .sort({ type: 1, installmentNumber: 1, createdAt: 1 });

    const propertiesBought = await ApartmentUnit.countDocuments({
      customerId: req.params.userId,
      status: { $in: ["Sold", "Booked"] },
    });

    res.status(200).json({
      membership,
      stats: {
        shares: membership.shares,
        totalApprovedPaid: membership.totalApprovedPaid,
        propertiesBought,
        ...computeStats(ledger),
      },
      ledger,
    });
  } catch (error) {
    console.error("getMemberProfile error:", error);
    res.status(500).json({ message: "Server error fetching member profile." });
  }
};

module.exports = { makeStageHandlers, getMembers, getMemberProfile };
