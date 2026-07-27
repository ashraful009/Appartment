const express = require("express");
const router  = express.Router();
const { login, logout, getMe, register } = require("./authController");
const { protect } = require("../../middleware/authMiddleware");

const rateLimit = require("express-rate-limit");

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 10, 
  message: { message: "Too many login/register attempts from this IP, please try again after 15 minutes" },
});

const { validate } = require("../../middleware/validate");
const { loginSchema, registerSchema } = require("../../schemas/authSchemas");


router.post("/register", authLimiter, validate(registerSchema), register);




router.post("/login", authLimiter, validate(loginSchema), login);




router.post("/logout", protect, logout);




router.get("/me", protect, getMe);

module.exports = router;
