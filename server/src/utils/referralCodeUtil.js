const User = require("../models/User");

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

/**
 * Generate a random 4-character alphanumeric string (uppercase + digits).
 */
const randomCode = () =>
  Array.from({ length: 4 }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join("");

/**
 * generateUniqueReferralCode()
 * Attempts up to 10 times to produce a 4-char code not already in the DB.
 * Throws if it cannot find a unique one (extremely unlikely with 36^4 = 1.6M combos).
 */
const generateUniqueReferralCode = async () => {
  for (let i = 0; i < 10; i++) {
    const code = randomCode();
    const exists = await User.exists({ referralCode: code });
    if (!exists) return code;
  }
  throw new Error("Could not generate a unique referral code after 10 attempts.");
};

module.exports = { generateUniqueReferralCode };
