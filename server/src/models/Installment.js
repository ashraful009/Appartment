const mongoose = require("mongoose");

const installmentSchema = new mongoose.Schema(
  {
    // ── References ────────────────────────────────────────────────
    unitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ApartmentUnit",
      required: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ── Identity ──────────────────────────────────────────────────
    // e.g. "Booking Money", "Down Payment", "EMI - Month 1"
    installmentName: {
      type: String,
      required: true,
      trim: true,
    },

    // ── Charge breakdown (all in BDT) ─────────────────────────────
    chargeBreakdown: {
      baseAmount:       { type: Number, default: 0 },
      parking:          { type: Number, default: 0 },
      financialService: { type: Number, default: 0 },
      serviceCharge:    { type: Number, default: 0 },
    },

    // ── Penalty & total ───────────────────────────────────────────
    latePenalty: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
    },

    // ── Dates ─────────────────────────────────────────────────────
    invoiceDate: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
    },

    // ── Payment Proof ─────────────────────────────────────────────
    paymentDetails: {
      bankName: { type: String },
      accountNumber: { type: String },
      invoiceUrl: { type: String },
    },

    // ── Status ────────────────────────────────────────────────────
    status: {
      type: String,
      enum: ["Unpaid", "Pending", "Paid", "Overdue"],
      default: "Unpaid",
    },
  },
  { timestamps: true }
);

// Useful indexes for common queries
installmentSchema.index({ unitId: 1 });
installmentSchema.index({ customerId: 1 });
installmentSchema.index({ status: 1 });

module.exports = mongoose.model("Installment", installmentSchema);
