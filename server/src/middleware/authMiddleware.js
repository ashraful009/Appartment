const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * protect — Verify JWT from HttpOnly cookie and attach user to req.user.
 */
const protect = async (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({ message: "Not authorized. No token found." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "Not authorized. User not found." });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Session expired. Please log in again." });
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token." });
    }
    res.status(500).json({ message: "Server error during authentication." });
  }
};

/**
 * authorizeRoles(...roles) — Role-Based Access Control middleware factory.
 *
 * Usage: authorizeRoles("admin") or authorizeRoles("admin", "seller")
 *
 * User.roles is now a string[] e.g. ["user", "admin"].
 * A user passes if their roles array contains ANY of the specified roles.
 */
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated." });
    }

    const userRoles = req.user.roles || [];
    const hasPermission = allowedRoles.some((role) => userRoles.includes(role));

    if (!hasPermission) {
      return res.status(403).json({
        message: `Access denied. Required role(s): ${allowedRoles.join(", ")}.`,
      });
    }

    next();
  };
};

/**
 * optionalAuth — Soft-protect middleware.
 * If a valid JWT cookie is present, attach the user to req.user.
 * If no token or invalid token, silently continue as a guest.
 * Never returns 401 — guests are always allowed through.
 */
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.cookies?.token;
    if (!token) return next();

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (user) req.user = user;
  } catch (_) {
    // Invalid or expired token — treat as guest, do not block
  }
  next();
};

module.exports = { protect, authorizeRoles, optionalAuth };
