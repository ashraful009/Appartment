const mongoose = require("mongoose");

/**
 * Project
 * ─────────────────────────────────────────────────────────────────────────────
 * Lightweight running/completed projects shown to members & investors.
 * Admin populates the real content later — this just provides the structure.
 */
const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Project name is required"],
      trim: true,
    },
    description: { type: String, default: "" },
    status: {
      type: String,
      enum: ["running", "completed"],
      default: "running",
    },
    // Stored as the 1st of the target month; the UI only picks month + year.
    expectedCompleteDate: { type: Date, default: null },
    coverImage: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", projectSchema);
