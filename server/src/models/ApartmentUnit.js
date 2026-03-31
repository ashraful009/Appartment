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
    actionTimestamp: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ApartmentUnit", apartmentUnitSchema);
