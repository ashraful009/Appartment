const crypto = require("crypto");
const Membership       = require("../models/Membership");
const InvestmentLedger = require("../models/InvestmentLedger");
const ApartmentUnit    = require("../models/ApartmentUnit");
const {
  BOOKING_MONEY,
  DOWNPAYMENT_TARGET,
} = require("../config/investmentConstants");

// ─────────────────────────────────────────────────────────────────────────────
// Helper — validate & normalise the payment method + details from the body.
// Returns { method, details } on success, or { error } on validation failure.
// ─────────────────────────────────────────────────────────────────────────────
const buildPaymentInfo = (body = {}) => {
  const method = body.paymentMethod;
  if (!["MFS", "Bank", "Cash"].includes(method)) {
    return { error: "A valid payment method (MFS, Bank, or Cash) is required." };
  }

  const details = {
    provider:      body.provider      || "",
    mobileNumber:  body.mobileNumber  || "",
    bankName:      body.bankName      || "",
    accountNumber: body.accountNumber || "",
    holderName:    body.holderName    || "",
    transactionId: body.transactionId || "",
  };

  if (method === "MFS") {
    if (!["Bikash", "Nagad", "Rocket", "Upay"].includes(details.provider))
      return { error: "Select an MFS provider (Bikash, Nagad, Rocket, or Upay)." };
    if (!details.mobileNumber) return { error: "MFS mobile number is required." };
    if (!details.transactionId) return { error: "MFS transaction ID is required." };
  } else if (method === "Bank") {
    if (!details.bankName) return { error: "Select a bank." };
    if (!details.accountNumber) return { error: "Bank account number is required." };
    if (!details.transactionId) return { error: "Bank transaction ID is required." };
  }

  return { method, details };
};

// ─────────────────────────────────────────────────────────────────────────────
// Helper — build a per-membership summary used by the panels.
// ─────────────────────────────────────────────────────────────────────────────
const IN_PROGRESS = ["Pending", "AccountantConfirmed", "DataEntryConfirmed"];

const buildSummary = (ledger) => {
  const installments = ledger.filter((e) => e.type === "installment");
  const sum = (arr) => arr.reduce((s, e) => s + (e.amount || 0), 0);
  const inProgress = (e) => IN_PROGRESS.includes(e.status);

  return {
    totalPaid:        sum(ledger.filter((e) => e.status === "Paid")),
    totalPending:     sum(ledger.filter(inProgress)),
    installmentsProvided: sum(installments.filter((e) => e.status === "Paid")),
    installmentsDue:      sum(installments.filter((e) => e.status === "Unpaid")),
    installmentsPending:  sum(installments.filter(inProgress)),
    installmentsTotal:    installments.length,
    installmentsPaidCount: installments.filter((e) => e.status === "Paid").length,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get the current user's membership + ledger
// @route   GET /api/membership/me
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const getMyMembership = async (req, res) => {
  try {
    const membership = await Membership.findOne({ userId: req.user._id });
    if (!membership) {
      return res.status(200).json({ membership: null, ledger: [], summary: null });
    }

    const ledger = await InvestmentLedger.find({ membershipId: membership._id }).sort({
      type: 1,
      installmentNumber: 1,
      createdAt: 1,
    });

    // Any unit Management has allocated to this investor (for display).
    const allocatedUnit = await ApartmentUnit.findOne({ allocatedTo: req.user._id })
      .populate("propertyId", "name address mainImage handoverTime")
      .select("unitName floor status handoverMonth handoverYear propertyId");

    res.status(200).json({
      membership,
      ledger,
      summary: buildSummary(ledger),
      allocatedUnit,
    });
  } catch (error) {
    console.error("Error fetching membership:", error);
    res.status(500).json({ message: "Server error fetching membership." });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Submit booking money to become a member (self-serve)
// @route   POST /api/membership/booking
// @access  Private  (multipart: field "invoice")
// ─────────────────────────────────────────────────────────────────────────────
const submitBooking = async (req, res) => {
  try {
    const existing = await Membership.findOne({ userId: req.user._id });
    if (existing) {
      return res.status(400).json({
        message: "You already have an active membership journey.",
      });
    }

    const invoiceUrl = req.file?.path || "";
    if (!invoiceUrl) {
      return res.status(400).json({ message: "An invoice file is required." });
    }

    const payment = buildPaymentInfo(req.body);
    if (payment.error) return res.status(400).json({ message: payment.error });

    const membership = await Membership.create({
      userId: req.user._id,
      status: "pending_booking",
      bookingMoney: BOOKING_MONEY,
    });

    await InvestmentLedger.create({
      membershipId: membership._id,
      userId: req.user._id,
      type: "booking",
      amount: BOOKING_MONEY,
      dueDate: new Date(),
      status: "Pending",
      paymentMethod: payment.method,
      paymentDetails: payment.details,
      invoiceUrl,
      description: req.body.description || "",
      submittedAt: new Date(),
    });

    res.status(201).json({
      message: "Booking submitted. Awaiting admin approval.",
      membership,
    });
  } catch (error) {
    console.error("Error submitting booking:", error);
    res.status(500).json({ message: "Server error submitting booking." });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Submit the down payment to become an investor
// @route   POST /api/membership/downpayment
// @access  Private  (multipart: field "invoice")
// ─────────────────────────────────────────────────────────────────────────────
const submitDownPayment = async (req, res) => {
  try {
    const membership = await Membership.findOne({ userId: req.user._id });
    if (!membership) {
      return res.status(404).json({ message: "No membership found." });
    }
    if (membership.status !== "member") {
      return res.status(400).json({
        message: "Down payment can only be submitted by an active member.",
      });
    }
    if (membership.memberDeadline && new Date() > membership.memberDeadline) {
      return res.status(400).json({
        message: "Your 6-month membership window has expired.",
      });
    }

    const amount = Number(req.body.amount);
    if (!amount || amount < DOWNPAYMENT_TARGET) {
      return res.status(400).json({
        message: `Down payment must be at least ৳${DOWNPAYMENT_TARGET.toLocaleString()}.`,
      });
    }

    const invoiceUrl = req.file?.path || "";
    if (!invoiceUrl) {
      return res.status(400).json({ message: "An invoice file is required." });
    }

    const payment = buildPaymentInfo(req.body);
    if (payment.error) return res.status(400).json({ message: payment.error });

    // The new cash collected now = chosen downpayment minus the already-paid booking.
    const newCash = amount - membership.bookingMoney;

    membership.downPaymentAmount = amount;
    await membership.save();

    // Reuse an existing un-approved downpayment entry if the member re-submits.
    let entry = await InvestmentLedger.findOne({
      membershipId: membership._id,
      type: "downpayment",
      status: { $ne: "Paid" },
    });

    if (entry) {
      entry.amount = newCash;
      entry.paymentMethod = payment.method;
      entry.paymentDetails = payment.details;
      entry.invoiceUrl = invoiceUrl;
      entry.description = req.body.description || "";
      entry.status = "Pending";
      entry.submittedAt = new Date();
      await entry.save();
    } else {
      entry = await InvestmentLedger.create({
        membershipId: membership._id,
        userId: req.user._id,
        type: "downpayment",
        amount: newCash,
        dueDate: new Date(),
        status: "Pending",
        paymentMethod: payment.method,
        paymentDetails: payment.details,
        invoiceUrl,
        description: req.body.description || "",
        submittedAt: new Date(),
      });
    }

    res.status(200).json({
      message: "Down payment submitted. Awaiting admin approval.",
      entry,
    });
  } catch (error) {
    console.error("Error submitting down payment:", error);
    res.status(500).json({ message: "Server error submitting down payment." });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Submit one or more installments together (one invoice covers all)
// @route   POST /api/membership/installments/pay
// @access  Private  (multipart: field "invoice", body installmentIds[])
// ─────────────────────────────────────────────────────────────────────────────
const payInstallments = async (req, res) => {
  try {
    const membership = await Membership.findOne({ userId: req.user._id });
    if (!membership || membership.status !== "investor") {
      return res.status(400).json({ message: "Only investors can pay installments." });
    }

    // installmentIds can arrive as an array or a single value (form-data)
    let ids = req.body.installmentIds;
    if (!ids) return res.status(400).json({ message: "No installments selected." });
    if (!Array.isArray(ids)) ids = [ids];

    const invoiceUrl = req.file?.path || "";
    if (!invoiceUrl) {
      return res.status(400).json({ message: "An invoice file is required." });
    }

    const payment = buildPaymentInfo(req.body);
    if (payment.error) return res.status(400).json({ message: payment.error });

    // Only allow the caller's own, currently-Unpaid installments.
    const entries = await InvestmentLedger.find({
      _id: { $in: ids },
      membershipId: membership._id,
      type: "installment",
      status: "Unpaid",
    });

    if (entries.length === 0) {
      return res.status(400).json({ message: "No valid unpaid installments to submit." });
    }

    const batchId = crypto.randomUUID();
    const now = new Date();

    await InvestmentLedger.updateMany(
      { _id: { $in: entries.map((e) => e._id) } },
      {
        $set: {
          status: "Pending",
          paymentMethod: payment.method,
          paymentDetails: payment.details,
          invoiceUrl,
          description: req.body.description || "",
          batchId,
          submittedAt: now,
        },
      }
    );

    res.status(200).json({
      message: `${entries.length} installment(s) submitted. Awaiting admin approval.`,
      batchId,
      count: entries.length,
    });
  } catch (error) {
    console.error("Error submitting installments:", error);
    res.status(500).json({ message: "Server error submitting installments." });
  }
};

module.exports = {
  getMyMembership,
  submitBooking,
  submitDownPayment,
  payInstallments,
};
