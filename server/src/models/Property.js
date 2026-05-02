const mongoose = require("mongoose");

const apartmentSizeSchema = new mongoose.Schema(
  {
    type:        { type: String, trim: true }, // e.g. "Type A"
    size:        { type: String, trim: true }, // e.g. "2448 sft"
    description: { type: String, trim: true }, // e.g. "3 bed, 2 bath"
  },
  { _id: false }
);

const propertySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Property name is required"],
      trim: true,
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
    },
    mainImage: {
      type: String,
      default: null,   // Cloudinary secure URL
    },
    mainImagePublicId: {
      type: String,
      default: null,
    },
    extraImages: {
      type: [String],  // Cloudinary secure URLs
      default: [],
    },
    extraImagePublicIds: {
      type: [String],
      default: [],
    },
    totalUnits: {
      type: Number,
      default: 0,
    },
    floors: {
      type: Number,
      default: 0,
    },
    landSize: {
      type: String,
      trim: true,
      default: "",
    },
    handoverTime: {
      type: String,
      trim: true,
      default: "",
    },
    parkingArea: {
      type: String,
      trim: true,
      default: "",
    },
    description: {
      type: String,
      required: [true, "Property description is required"],
      trim: true,
    },
    mapLocation: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
    },
    displayOrder: {
      type: Number,
      default: 999,
    },
    apartmentSizes: {
      type: [apartmentSizeSchema],
      default: [],
    },
    // ── New fields for filtering & categorization ──────────────────────────
    area: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Area",
      default: null,
    },
    status: {
      type: String,
      enum: ["Ongoing", "Completed", "Upcoming"],
      default: "Ongoing",
    },
    installmentType: {
      type: [String],
      enum: ["Long-term", "Short-term"],
      default: ["Long-term"],
    },
    totalPrice: {
      type: Number,
      default: 0,
    },
    totalSqft: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Property", propertySchema);
