const mongoose = require("mongoose");

const DOCUMENT_TITLES = [
  "NID",
  "Passport",
  "TIN Certificate",
  "Booking Receipt",
  "Other",
];

const documentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "user is required"],
  },
  title: {
    type: String,
    enum: {
      values: DOCUMENT_TITLES,
      message: '"{VALUE}" is not a valid document type.',
    },
    required: [true, "title is required"],
  },
  fileUrl: {
    type: String,
    required: [true, "fileUrl is required"], // Cloudinary secure URL
  },
  publicId: {
    type: String,
    required: [true, "publicId is required"], // For Cloudinary deletion
  },
  status: {
    type: String,
    enum: ["Pending Verification", "Verified", "Rejected"],
    default: "Pending Verification",
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

// Efficient per-user lookups sorted by uploadedAt
documentSchema.index({ user: 1, uploadedAt: -1 });

module.exports = mongoose.model("Document", documentSchema);
