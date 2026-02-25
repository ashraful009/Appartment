const mongoose = require("mongoose");

const apartmentSizeSchema = new mongoose.Schema(
  {
    type: { type: String, trim: true }, // e.g. "Type A"
    size: { type: String, trim: true }, // e.g. "2448 sft"
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
    apartmentSizes: {
      type: [apartmentSizeSchema],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Property", propertySchema);
