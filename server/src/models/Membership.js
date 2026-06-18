const mongoose = require("mongoose");
const {
  BOOKING_MONEY,
  DOWNPAYMENT_TARGET,
  TOTAL_TARGET,
  INSTALLMENT_AMOUNT,
} = require("../config/investmentConstants");

/**
 * Membership
 * ─────────────────────────────────────────────────────────────────────────────
 * One document per user — represents a single standalone investment journey:
 *   user → member (booking) → investor (downpayment) → installments → 50 lakh.
 *
 * status lifecycle:
 *   pending_booking — booking money submitted, awaiting admin approval
 *   member          — booking approved; must complete downpayment within 6 months
 *   investor        — downpayment approved; installments generated
 *   lapsed          — failed to complete downpayment within the 6-month window
 */
const membershipSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      default: null,
    },
    status: {
      type: String,
      enum: ["pending_booking", "member", "investor", "lapsed"],
      default: "pending_booking",
    },

    // ── Booking ──────────────────────────────────────────────────────
    bookingMoney: { type: Number, default: BOOKING_MONEY },
    becameMemberAt: { type: Date, default: null }, // set when booking approved
    memberDeadline: { type: Date, default: null }, // becameMemberAt + 6 months

    // ── Down payment ─────────────────────────────────────────────────
    downPaymentTarget: { type: Number, default: DOWNPAYMENT_TARGET },
    downPaymentAmount: { type: Number, default: 0 }, // chosen amount (>= target)
    downPaymentCompletedAt: { type: Date, default: null }, // set when approved → investor

    // ── Totals & shares (cached, recomputed on every approval) ───────
    totalTarget: { type: Number, default: TOTAL_TARGET },
    installmentAmount: { type: Number, default: INSTALLMENT_AMOUNT },
    installmentsGenerated: { type: Boolean, default: false },
    totalApprovedPaid: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// One investment journey per user per property
membershipSchema.index({ userId: 1, propertyId: 1 }, { unique: true });

module.exports = mongoose.model("Membership", membershipSchema);
