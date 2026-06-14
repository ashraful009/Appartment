const mongoose = require("mongoose");

const apartmentUnitSchema = new mongoose.Schema(
  {
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    floor: {
      type: Number,
      required: true,
    },
    columnLine: {
      type: String,
      required: true,
    },
    unitName: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Unsold", "Sold", "Booked"],
      default: "Unsold",
    },
    actionBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    customerName: {
      type: String,
      trim: true,
      default: null,
    },
    customerPhone: {
      type: String,
      trim: true,
      default: null,
    },
    // Strong DB relationship — populated when a registered user matches the customerPhone
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    // Which role the actor was using when they performed the action
    // (e.g. an admin can also be a seller — this records the active context)
    actionRoleContext: {
      type: String,
      enum: ["admin", "seller", "Director", "GM", "AGM", "Accountent"],
      default: null,
    },
    isDocumentReady: {
      type: Boolean,
      default: false,
    },
    specs: {
      squareFt: Number,
      bedrooms: Number,
      washrooms: Number,
      kitchen: Number,
      balconies: Number,
      drawingRoom: Number,
      dining: Number,
    },
    financials: {
      unitPrice:              Number,
      bookingMoney:           Number,
      downPayment:            Number,
      parkingCharge:          Number,
      financialServiceCharge: Number,
      latePaymentPenalty:     Number,
      serviceCharge:          Number,
      totalPayable:           Number,
    },

    // ── EMI tracking (populated by Accountant on first document processing) ──
    emiAmount: {
      type:    Number,
      default: null,
    },
    remainingEmis: {
      type:    Number,
      default: 184,
    },
    actionTimestamp: {
      type: Date,
      default: null,
    },

    // ── Investor allocation (set by Management on the Building Allocate page) ──
    // When a unit is allocated to an investor it is marked "Booked" and these
    // fields record who it's for, who allocated it, and the handover month/year.
    allocatedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    allocatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    allocatedAt: {
      type: Date,
      default: null,
    },
    handoverMonth: {
      type: Number, // 1–12
      min: 1,
      max: 12,
      default: null,
    },
    handoverYear: {
      type: Number,
      default: null,
    },

  },
  { timestamps: true }
);

module.exports = mongoose.model("ApartmentUnit", apartmentUnitSchema);
