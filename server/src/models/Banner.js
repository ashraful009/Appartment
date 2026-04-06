const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      default: "",
    },

    // 'image' or 'video'
    mediaType: {
      type: String,
      enum: ["image", "video"],
      default: "image",
    },

    // URL shown on desktop (≥ 768 px) — Cloudinary secure_url
    desktopMediaUrl: {
      type: String,
      required: [true, "Desktop media URL is required"],
      trim: true,
    },

    // URL shown on mobile (< 768 px) — Cloudinary secure_url
    mobileMediaUrl: {
      type: String,
      required: [true, "Mobile media URL is required"],
      trim: true,
    },

    // Cloudinary public_ids for later deletion
    desktopPublicId: { type: String, default: "" },
    mobilePublicId:  { type: String, default: "" },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Banner", bannerSchema);
