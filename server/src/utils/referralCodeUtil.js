const userRepository = require("../repositories/UserRepository");

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";


const randomCode = () =>
  Array.from({ length: 4 }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join("");


const generateUniqueReferralCode = async () => {
  for (let i = 0; i < 10; i++) {
    const code = randomCode();
    const exists = await userRepository.findOne({ referral_code: code });
    if (!exists) return code;
  }
  throw new Error("Could not generate a unique referral code after 10 attempts.");
};

module.exports = { generateUniqueReferralCode };
