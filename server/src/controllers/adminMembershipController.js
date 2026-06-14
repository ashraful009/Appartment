const Membership         = require("../models/Membership");
const InvestmentLedger   = require("../models/InvestmentLedger");
const InvestmentSettings = require("../models/InvestmentSettings");
const User               = require("../models/User");
const { BOOKING_MONEY } = require("../config/investmentConstants");
const {
  finalizeEntry,
  applyDueDayToAllInstallments,
} = require("../services/membershipService");

const IN_PROGRESS = ["Pending", "AccountantConfirmed", "DataEntryConfirmed"];
const STAGE_LABEL = {
  Pending: "Awaiting Accountant",
  AccountantConfirmed: "Awaiting Data Entry",
  DataEntryConfirmed: "Awaiting Management",
  Paid: "Completed",
  Unpaid: "Not submitted",
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    List all memberships (with user info + cached totals)
// @route   GET /api/admin/memberships?status=
// @access  Private (Admin)
// ─────────────────────────────────────────────────────────────────────────────
const listMemberships = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;

    const memberships = await Membership.find(filter)
      .populate("userId", "name email phone profilePhoto")
      .sort({ updatedAt: -1 });

    // Attach a count of payments still moving through the confirmation pipeline.
    const ids = memberships.map((m) => m._id);
    const counts = await InvestmentLedger.aggregate([
      { $match: { membershipId: { $in: ids }, status: { $in: IN_PROGRESS } } },
      { $group: { _id: "$membershipId", count: { $sum: 1 } } },
    ]);
    const inProgressMap = Object.fromEntries(
      counts.map((c) => [c._id.toString(), c.count])
    );

    const result = memberships.map((m) => ({
      ...m.toObject(),
      inProgressCount: inProgressMap[m._id.toString()] || 0, // payments in the pipeline
    }));

    res.status(200).json(result);
  } catch (error) {
    console.error("Error listing memberships:", error);
    res.status(500).json({ message: "Server error listing memberships." });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Full payment detail for one user (the "all info" page)
// @route   GET /api/admin/memberships/:userId
// @access  Private (Admin)
// ─────────────────────────────────────────────────────────────────────────────
const getMembershipDetail = async (req, res) => {
  try {
    const membership = await Membership.findOne({ userId: req.params.userId }).populate(
      "userId",
      "name email phone profilePhoto"
    );
    if (!membership) {
      return res.status(404).json({ message: "Membership not found." });
    }

    const ledger = await InvestmentLedger.find({ membershipId: membership._id })
      .populate("audit.accountant.by", "name")
      .populate("audit.dataEntry.by", "name")
      .populate("audit.management.by", "name")
      .sort({
        type: 1,
        installmentNumber: 1,
        createdAt: 1,
      });

    const sum = (arr) => arr.reduce((s, e) => s + (e.amount || 0), 0);
    const totals = {
      booking:       sum(ledger.filter((e) => e.type === "booking" && e.status === "Paid")),
      downpayment:   sum(ledger.filter((e) => e.type === "downpayment" && e.status === "Paid")),
      installments:  sum(ledger.filter((e) => e.type === "installment" && e.status === "Paid")),
      totalPaid:     sum(ledger.filter((e) => e.status === "Paid")),
      totalPending:  sum(ledger.filter((e) => IN_PROGRESS.includes(e.status))),
      totalDue:      sum(ledger.filter((e) => e.status === "Unpaid")),
    };

    res.status(200).json({
      membership,
      ledger,
      totals,
    });
  } catch (error) {
    console.error("Error fetching membership detail:", error);
    res.status(500).json({ message: "Server error fetching membership detail." });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Admin manually creates a booking/membership for a user
// @route   POST /api/admin/memberships
// @access  Private (Admin)
//          body: { userId, autoApprove?: boolean }
// ─────────────────────────────────────────────────────────────────────────────
const createBookingForUser = async (req, res) => {
  try {
    const { userId, autoApprove } = req.body;
    if (!userId) return res.status(400).json({ message: "userId is required." });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    const existing = await Membership.findOne({ userId });
    if (existing) {
      return res.status(400).json({ message: "This user already has a membership." });
    }

    const membership = await Membership.create({
      userId,
      status: "pending_booking",
      bookingMoney: BOOKING_MONEY,
    });

    const entry = await InvestmentLedger.create({
      membershipId: membership._id,
      userId,
      type: "booking",
      amount: BOOKING_MONEY,
      dueDate: new Date(),
      status: "Pending",
      description: "Created by admin",
      submittedAt: new Date(),
    });

    // Optionally finalize immediately so the user becomes a member at once
    // (admin shortcut that bypasses the staff confirmation pipeline).
    if (autoApprove) {
      await finalizeEntry(entry, req.user._id);
    }

    const fresh = await Membership.findById(membership._id);
    res.status(201).json({ message: "Membership created.", membership: fresh });
  } catch (error) {
    console.error("Error creating membership:", error);
    res.status(500).json({ message: "Server error creating membership." });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Payment Tracking — the full confirmation pipeline for monitoring.
//          Returns every submitted/in-flight/completed payment with its current
//          stage and the full audit trail (who confirmed each step and when).
// @route   GET /api/admin/payment-tracking?status=
// @access  Private (Admin)
// ─────────────────────────────────────────────────────────────────────────────
const getPaymentTracking = async (req, res) => {
  try {
    const filter = { status: { $ne: "Unpaid" } }; // only payments that exist in the pipeline
    if (req.query.status) filter.status = req.query.status;

    const entries = await InvestmentLedger.find(filter)
      .populate("userId", "name email phone profilePhoto")
      .populate("audit.accountant.by", "name")
      .populate("audit.dataEntry.by", "name")
      .populate("audit.management.by", "name")
      .sort({ updatedAt: -1 });

    const result = entries.map((e) => ({
      ...e.toObject(),
      stageLabel: STAGE_LABEL[e.status] || e.status,
    }));

    res.status(200).json(result);
  } catch (error) {
    console.error("getPaymentTracking error:", error);
    res.status(500).json({ message: "Server error fetching payment tracking." });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get the global installment due day-of-month
// @route   GET /api/admin/settings/installment-due-day
// @access  Private (Admin)
// ─────────────────────────────────────────────────────────────────────────────
const getInstallmentDueDay = async (req, res) => {
  try {
    const settings = await InvestmentSettings.getSettings();
    res.status(200).json({ installmentDueDay: settings.installmentDueDay });
  } catch (error) {
    console.error("getInstallmentDueDay error:", error);
    res.status(500).json({ message: "Server error fetching due day." });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Set the global installment due day; re-pins ALL installment due dates
// @route   PUT /api/admin/settings/installment-due-day
// @access  Private (Admin)
// ─────────────────────────────────────────────────────────────────────────────
const setInstallmentDueDay = async (req, res) => {
  try {
    const day = Number(req.body.installmentDueDay);
    if (!Number.isInteger(day) || day < 1 || day > 31) {
      return res.status(400).json({ message: "Due day must be a whole number between 1 and 31." });
    }

    const settings = await InvestmentSettings.getSettings();
    settings.installmentDueDay = day;
    await settings.save();

    const updated = await applyDueDayToAllInstallments(day);

    res.status(200).json({
      message: `Installment due day set to ${day}. ${updated} installment(s) updated.`,
      installmentDueDay: day,
      updated,
    });
  } catch (error) {
    console.error("setInstallmentDueDay error:", error);
    res.status(500).json({ message: "Server error setting due day." });
  }
};

module.exports = {
  listMemberships,
  getMembershipDetail,
  createBookingForUser,
  getPaymentTracking,
  getInstallmentDueDay,
  setInstallmentDueDay,
};
