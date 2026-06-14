const mongoose = require("mongoose");

/**
 * InvestmentLedger
 * ─────────────────────────────────────────────────────────────────────────────
 * A single money entry in a member's investment journey. Unified ledger that
 * records booking money, the down payment, and every monthly installment —
 * powering both the member/investor panels and the admin payment-detail page.
 *
 * status lifecycle (flow: user → accountant → data entry → management):
 *   Unpaid              — scheduled but not yet submitted by the user
 *   Pending             — user submitted, awaiting Accountant confirmation
 *   AccountantConfirmed — accountant confirmed, awaiting Data Entry Officer
 *   DataEntryConfirmed  — data entry confirmed, awaiting Management
 *   Paid                — management confirmed (final; triggers role/total side effects)
 *
 * Each confirmation stage is logged in `audit` (which staff member + when), so the
 * admin can monitor the full pipeline. Multiple staff per role are supported.
 */
const auditStageSchema = new mongoose.Schema(
  {
    by: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    at: { type: Date, default: null },
  },
  { _id: false }
);
const investmentLedgerSchema = new mongoose.Schema(
  {
    membershipId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Membership",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      enum: ["booking", "downpayment", "installment"],
      required: true,
    },
    installmentNumber: { type: Number, default: null }, // for type === 'installment'

    amount: { type: Number, required: true },
    dueDate: { type: Date, default: Date.now }, // installment due date; booking/downpayment = creation time

    status: {
      type: String,
      enum: ["Unpaid", "Pending", "AccountantConfirmed", "DataEntryConfirmed", "Paid"],
      default: "Unpaid",
    },

    // ── Payment method & details (captured on the payment page) ───────
    paymentMethod: {
      type: String,
      enum: ["MFS", "Bank", "Cash", null],
      default: null,
    },
    paymentDetails: {
      provider: { type: String, default: "" },      // MFS: Bikash / Nagad / Rocket / Upay
      mobileNumber: { type: String, default: "" },   // MFS sender number
      bankName: { type: String, default: "" },       // Bank
      accountNumber: { type: String, default: "" },  // Bank
      holderName: { type: String, default: "" },     // Bank account holder
      transactionId: { type: String, default: "" },  // MFS / Bank reference
    },

    // ── Payment proof ────────────────────────────────────────────────
    invoiceUrl: { type: String, default: "" },
    description: { type: String, default: "" },
    batchId: { type: String, default: null }, // groups installments paid together

    submittedAt: { type: Date, default: null },

    // ── Multi-stage confirmation audit trail ─────────────────────────
    // accountant → dataEntry → management; each records who confirmed & when.
    audit: {
      accountant: { type: auditStageSchema, default: () => ({}) },
      dataEntry:  { type: auditStageSchema, default: () => ({}) },
      management: { type: auditStageSchema, default: () => ({}) },
    },
  },
  { timestamps: true }
);

investmentLedgerSchema.index({ userId: 1, type: 1 });
investmentLedgerSchema.index({ membershipId: 1 });
investmentLedgerSchema.index({ status: 1 });
investmentLedgerSchema.index({ batchId: 1 });

module.exports = mongoose.model("InvestmentLedger", investmentLedgerSchema);
