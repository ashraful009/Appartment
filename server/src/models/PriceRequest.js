const mongoose = require("mongoose");

const priceRequestSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: [true, "Property is required"],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    status: {
      type: String,
      enum: ["pending", "assigned"],
      default: "pending",
    },
    // Renamed from claimedBy → assignedTo (Admin-Assigns model)
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    // Tracks when the admin (or referral logic) assigned this lead
    assignedAt: {
      type: Date,
      default: null,
    },
    conversionStatus: {
      type: String,
      enum: ["none", "pending_approval", "approved", "rejected"],
      default: "none",
    },
    // Tracks whether this lead's user is being promoted to a seller
    sellerConversionStatus: {
      type: String,
      enum: ["none", "pending_approval", "approved", "rejected"],
      default: "none",
    },

    // ── CRM Pipeline Fields ────────────────────────────────────────────────
    pipelineStage: {
      type: String,
      enum: ["New", "Contacted", "Site Visited", "Negotiation", "Closed Won", "Closed Lost"],
      default: "New",
    },
    priority: {
      type: String,
      enum: ["Hot", "Warm", "Cold"],
      default: "Warm",
    },
    clientPreferences: {
      budget: { type: String, default: "" },
      location: { type: String, default: "" },
      bedrooms: { type: Number, default: null },
      notes: { type: String, default: "" },
    },
    lastInteractionDate: {
      type: Date,
      default: Date.now,
    },
    // ── Lead Source ────────────────────────────────────────────────────────────
    leadSource: {
      type: String,
      enum: ["Website", "Facebook", "Agent Referral", "Organic Search", "Other"],
      default: "Website",
    },
  },
  { timestamps: true }
);

// Prevent duplicate requests: one per user per property
priceRequestSchema.index({ property: 1, user: 1 }, { unique: true });

module.exports = mongoose.model("PriceRequest", priceRequestSchema);
