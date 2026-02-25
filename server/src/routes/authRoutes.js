const express = require("express");
const router  = express.Router();
const { login, logout, getMe, register } = require("../controllers/authController");
const { protect }       = require("../middleware/authMiddleware");
const { uploadAvatar }  = require("../middleware/uploadMiddleware");

// @route  POST /api/auth/register
// @desc   Register a new user (optional avatar upload to Cloudinary)
// @access Public
router.post("/register", uploadAvatar, register);

// @route  POST /api/auth/login
// @desc   Login user and set HttpOnly cookie
// @access Public
router.post("/login", login);

// @route  POST /api/auth/logout
// @desc   Logout user and clear cookie
// @access Private
router.post("/logout", protect, logout);

// @route  GET /api/auth/me
// @desc   Get currently authenticated user
// @access Private
router.get("/me", protect, getMe);

module.exports = router;
