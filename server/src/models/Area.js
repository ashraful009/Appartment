const mongoose = require("mongoose");

const areaSchema = new mongoose.Schema(
  {
    country: {
      type: String,
      required: [true, "Country name is required"],
      trim: true,
    },
    city: {
      type: String,
      required: [true, "City name is required"],
      trim: true,
    },
    name: {
      type: String,
      required: [true, "Area name is required"],
      trim: true,
    },
  },
  { timestamps: true }
);

areaSchema.index({ country: 1, city: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("Area", areaSchema);
