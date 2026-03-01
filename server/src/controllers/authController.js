const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Helper: Generate JWT (7-day) and set it as an HttpOnly cookie
 */
const sendTokenCookie = (res, user) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  const isProduction = process.env.NODE_ENV === "production";

  res.cookie("token", token, {
    httpOnly: true,                      // JS cannot access this cookie
    secure: isProduction,                // HTTPS only in production
    sameSite: "strict",                  // CSRF protection
    maxAge: 7 * 24 * 60 * 60 * 1000,   // 7 days in ms
  });

  return token;
};

// ─────────────────────────────────────────────
// @desc    Register user (with optional avatar)
// @route   POST /api/auth/register
// @access  Public
// ─────────────────────────────────────────────
const register = async (req, res) => {
  try {
    const { name, email, password, phone, referralCode } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({ message: "Name, email, phone, and password are required." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "An account with this email already exists." });
    }

    // ── Validate referral code → resolve to a seller ObjectId ────────────────
    let referredBy = null;
    if (referralCode) {
      const mongoose = require("mongoose");
      if (mongoose.Types.ObjectId.isValid(referralCode)) {
        const seller = await User.findOne({ _id: referralCode, roles: "seller" }).select("_id");
        if (seller) referredBy = seller._id;
      }
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      referralCode: referralCode || null,
      referredBy,
    });

    sendTokenCookie(res, user);

    res.status(201).json({
      message: "Registration successful.",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        referralCode: user.referralCode,
        roles: user.roles,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(". ") });
    }
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

    // Validate input
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    // Find user — explicitly select password (it's excluded by default)
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Compare passwords
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Generate token and set HttpOnly cookie
    sendTokenCookie(res, user);

    // Return user info (never return password)
    res.status(200).json({
      message: "Login successful.",
      user: {
        _id:    user._id,
        name:   user.name,
        email:  user.email,
        avatar: user.avatar,
        roles:  user.roles,
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
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
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
    // req.user is attached by the protect middleware
    res.status(200).json({
      user: req.user,
    });
  } catch (error) {
    console.error("GetMe error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

module.exports = { login, logout, getMe, register };
