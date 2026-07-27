const jwt = require("jsonwebtoken");
const userRepository = require("../repositories/UserRepository");


const protect = async (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({ message: "Not authorized. No token found." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!decoded.id || !uuidRegex.test(decoded.id)) {
      return res.status(401).json({ message: "Not authorized. Invalid token." });
    }

    const user = await userRepository.findById(decoded.id, ['id', 'name', 'email', 'phone', 'roles', 'profile_photo']);
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
    try {
      require("../utils/logger").logError("protect_auth_middleware", error);
    } catch (e) {}
    res.status(500).json({ message: "Server error during authentication." });
  }
};


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


const optionalAuth = async (req, res, next) => {
  try {
    const token = req.cookies?.token;
    if (!token) return next();

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (decoded.id && uuidRegex.test(decoded.id)) {
      const user = await userRepository.findById(decoded.id, ['id', 'name', 'email', 'phone', 'roles', 'profile_photo']);
      if (user) req.user = user;
    }
  } catch (_) {
    
  }
  next();
};

module.exports = { protect, authorizeRoles, optionalAuth };
