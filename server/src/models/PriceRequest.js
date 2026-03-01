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
  },
  { timestamps: true }
);

// Prevent duplicate requests: one per user per property
priceRequestSchema.index({ property: 1, user: 1 }, { unique: true });

module.exports = mongoose.model("PriceRequest", priceRequestSchema);
