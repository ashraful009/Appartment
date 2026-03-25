const mongoose = require("mongoose");

// ── Installment Sub-Schema ───────────────────────────────────────────────────
const installmentSchema = new mongoose.Schema(
  {
    installmentNumber: {
      type: Number,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Paid", "Overdue"],
      default: "Pending",
    },
    paidDate: {
      type: Date,
      default: null,
    },
    receiptUrl: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

// ── PaymentPlan Schema ───────────────────────────────────────────────────────
const paymentPlanSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "customerId is required"],
    },
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: [true, "propertyId is required"],
    },
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PriceRequest",
      default: null,
    },
    totalPrice: {
      type: Number,
      required: [true, "totalPrice is required"],
      min: 0,
    },
    bookingMoney: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalInstallments: {
      type: Number,
      required: [true, "totalInstallments is required"],
      min: 1,
    },
    installments: {
      type: [installmentSchema],
      default: [],
    },
  },
  { timestamps: true }
);

// Indexes for efficient per-customer and per-property lookups
paymentPlanSchema.index({ customerId: 1, createdAt: -1 });
paymentPlanSchema.index({ propertyId: 1 });

module.exports = mongoose.model("PaymentPlan", paymentPlanSchema);
