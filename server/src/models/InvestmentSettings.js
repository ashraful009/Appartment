const mongoose = require("mongoose");

/**
 * InvestmentSettings
 * ─────────────────────────────────────────────────────────────────────────────
 * Singleton document holding global, admin-controlled settings for the
 * investment journey. Currently just the installment due day-of-month, which is
 * applied to every investor's installments (month/year auto-derived, only the
 * day is admin-controlled). Access via getSettings() which lazily creates it.
 */
const investmentSettingsSchema = new mongoose.Schema(
  {
    // Singleton guard — always the same key so only one document ever exists.
    key: { type: String, default: "global", unique: true },

    // Day-of-month (1–31) every installment falls due on.
    installmentDueDay: { type: Number, default: 10, min: 1, max: 31 },
  },
  { timestamps: true }
);

/** Fetch the singleton settings doc, creating it with defaults if absent. */
investmentSettingsSchema.statics.getSettings = async function () {
  let doc = await this.findOne({ key: "global" });
  if (!doc) doc = await this.create({ key: "global" });
  return doc;
};

module.exports = mongoose.model("InvestmentSettings", investmentSettingsSchema);
