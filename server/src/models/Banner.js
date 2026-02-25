const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema(
  {
    images: {
      type: [String],
      required: [true, "At least one image is required"],
    },
    // Cloudinary public_ids for cleanup
    imagePublicIds: {
      type: [String],
      default: [],
    },
    motivationalText: {
      type: String,
      trim: true,
      default: "",
    },
    contactInfo: {
      type: String,
      trim: true,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Banner", bannerSchema);
