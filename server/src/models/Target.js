const mongoose = require("mongoose");

const targetSchema = new mongoose.Schema(
  {
    month: {
      type: String,    // e.g. "March"
      required: true,
      trim: true,
    },
    year: {
      type: Number,
      required: true,
    },
    globalTarget: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true }
);

// Compound unique index: only one target per month+year
targetSchema.index({ month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model("Target", targetSchema);
