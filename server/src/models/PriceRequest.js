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
      enum: ["pending", "claimed"],
      default: "pending",
    },
    claimedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

// Prevent duplicate requests: one per user per property
priceRequestSchema.index({ property: 1, user: 1 }, { unique: true });

module.exports = mongoose.model("PriceRequest", priceRequestSchema);
