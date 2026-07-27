const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const userRepository = require("../../repositories/UserRepository");
const { generateUniqueReferralCode } = require("../../utils/referralCodeUtil");
const { sendSuccess, sendError } = require("../../responses/apiResponse");

const sendTokenCookie = (res, user) => {
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  const isProduction = process.env.NODE_ENV === "production";

  res.cookie("token", token, {
    httpOnly: true,                      
    secure: isProduction,                
    sameSite: isProduction ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,   
  });

  return token;
};

const register = async (req, res) => {
  try {
    const { name, email, password, phone, referralCode } = req.body;

    if (!name || !email || !password || !phone) {
      return sendError(res, "Missing fields", "Name, email, phone, and password are required.", 400);
    }

    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      return sendError(res, "Duplicate", "An account with this email already exists.", 409);
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

    return sendSuccess(res, {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        referralCode: user.referral_code,
        roles: user.roles,
    }, "Registration successful.", 201);

  } catch (error) {
    console.error("Register error:", error);
    return sendError(res, error, "Server error. Please try again.", 500);
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, "Missing fields", "Email and password are required.", 400);
    }

    const user = await userRepository.findByEmailWithPassword(email);
    if (!user) {
      return sendError(res, "Unauthorized", "Invalid email or password.", 401);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return sendError(res, "Unauthorized", "Invalid email or password.", 401);
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

    let parsedRoles = [];
    if (typeof user.roles === 'string') {
      try {
        parsedRoles = JSON.parse(user.roles);
      } catch(e) {
        parsedRoles = [];
      }
    } else if (Array.isArray(user.roles)) {
      parsedRoles = user.roles;
    }

    return sendSuccess(res, {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.profile_photo,
        roles: parsedRoles,
        referralCode: user.referral_code ?? null,
    }, "Login successful.", 200);

  } catch (error) {
    console.error("Login error:", error);
    return sendError(res, error, "Server error. Please try again.", 500);
  }
};

const logout = async (req, res) => {
  try {
    const isProduction = process.env.NODE_ENV === "production";
    res.clearCookie("token", {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
    });

    return sendSuccess(res, null, "Logged out successfully.", 200);
  } catch (error) {
    console.error("Logout error:", error);
    return sendError(res, error, "Server error during logout.", 500);
  }
};

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

    let parsedRoles = [];
    if (typeof user.roles === 'string') {
      try {
        parsedRoles = JSON.parse(user.roles);
      } catch(e) {
        parsedRoles = [];
      }
    } else if (Array.isArray(user.roles)) {
      parsedRoles = user.roles;
    }
    
    user.roles = parsedRoles;

    return sendSuccess(res, { user }, "User fetched successfully", 200);
  } catch (error) {
    console.error("GetMe error:", error);
    return sendError(res, error, "Server error.", 500);
  }
};

module.exports = { login, logout, getMe, register };
