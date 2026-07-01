const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const userRepository = require("../repositories/UserRepository");
const { generateUniqueReferralCode } = require("../utils/referralCodeUtil");

/**
 * Helper: Generate JWT (7-day) and set it as an HttpOnly cookie
 */
const sendTokenCookie = (res, user) => {
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  const isProduction = process.env.NODE_ENV === "production";

  res.cookie("token", token, {
    httpOnly: true,                      // JS cannot access this cookie
    secure: isProduction,                // HTTPS only in production
    sameSite: isProduction ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,   // 7 days in ms
  });

  return token;
};

// ─────────────────────────────────────────────
// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
// ─────────────────────────────────────────────
const register = async (req, res) => {
  try {
    const { name, email, password, phone, referralCode } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({ message: "Name, email, phone, and password are required." });
    }

    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "An account with this email already exists." });
    }

    let referredBy = null;
    if (referralCode) {
      const seller = await userRepository.findOne({ referral_code: referralCode.trim().toUpperCase() });
      if (seller && seller.roles && seller.roles.includes("seller")) {
        referredBy = seller.id;
      }
    }

    let newUserReferralCode = null;
    try {
      newUserReferralCode = await generateUniqueReferralCode();
    } catch (codeErr) {
      console.error("Could not generate referral code on register:", codeErr);
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await userRepository.create({
      name,
      email,
      password: hashedPassword,
      phone,
      referral_code: newUserReferralCode,
      referred_by: referredBy,
      roles: ["user"],
    });

    sendTokenCookie(res, user);

    res.status(201).json({
      message: "Registration successful.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        referralCode: user.referral_code,
        roles: user.roles,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

// ─────────────────────────────────────────────
// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
// ─────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    const user = await userRepository.findByEmailWithPassword(email);
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    if (user.roles && user.roles.includes("seller") && !user.referral_code) {
      try {
        const newCode = await generateUniqueReferralCode();
        await userRepository.update(user.id, { referral_code: newCode });
        user.referral_code = newCode;
      } catch (codeErr) {
        console.error("Could not auto-generate referral code on login:", codeErr);
      }
    }

    sendTokenCookie(res, user);

    res.status(200).json({
      message: "Login successful.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.profile_photo,
        roles: user.roles,
        referralCode: user.referral_code ?? null,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

// ─────────────────────────────────────────────
// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private (protect)
// ─────────────────────────────────────────────
const logout = async (req, res) => {
  try {
    const isProduction = process.env.NODE_ENV === "production";
    res.clearCookie("token", {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
    });

    res.status(200).json({ message: "Logged out successfully." });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Server error during logout." });
  }
};

// ─────────────────────────────────────────────
// @desc    Get current logged-in user
// @route   GET /api/auth/me
// @access  Private (protect)
// ─────────────────────────────────────────────
const getMe = async (req, res) => {
  try {
    let user = req.user;

    if (user.roles?.includes("seller") && !user.referral_code) {
      try {
        const newCode = await generateUniqueReferralCode();
        await userRepository.update(user.id, { referral_code: newCode });
        user.referral_code = newCode;
      } catch (codeErr) {
        console.error("Could not auto-generate referral code on getMe:", codeErr);
      }
    }

    res.status(200).json({
      user,
    });
  } catch (error) {
    console.error("GetMe error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

module.exports = { login, logout, getMe, register };
