const User = require("../models/User");

const VALID_ROLES = ["user", "customer", "seller", "admin"];

// ─────────────────────────────────────────────
// @desc   Get admin dashboard stats
// @route  GET /api/admin/stats
// @access Private (admin)
// ─────────────────────────────────────────────
const getStats = async (req, res) => {
  try {
    const totalUsers     = await User.countDocuments();
    const totalCustomers = await User.countDocuments({ roles: "customer" });
    const totalSellers   = await User.countDocuments({ roles: "seller" });
    const totalSold      = 0; // Extend when Order/Sale model is added

    res.status(200).json({ totalUsers, totalCustomers, totalSellers, totalSold });
  } catch (error) {
    console.error("getStats error:", error);
    res.status(500).json({ message: "Failed to fetch stats." });
  }
};

// ─────────────────────────────────────────────
// @desc   Get all users
// @route  GET /api/admin/users
// @access Private (admin)
// ─────────────────────────────────────────────
const getUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("_id name email avatar roles createdAt")
      .sort({ createdAt: -1 });

    res.status(200).json({ users });
  } catch (error) {
    console.error("getUsers error:", error);
    res.status(500).json({ message: "Failed to fetch users." });
  }
};

// ─────────────────────────────────────────────
// @desc   Update user roles (full array replacement)
// @route  PUT /api/admin/users/:id/roles
// @access Private (admin)
// Body:   { roles: ["user", "customer"] }   — complete desired roles array
// ─────────────────────────────────────────────
const updateUserRoles = async (req, res) => {
  try {
    const { id } = req.params;
    let { roles } = req.body;

    if (!Array.isArray(roles)) {
      return res.status(400).json({ message: "roles must be an array." });
    }

    // Validate every value in the incoming array
    const invalid = roles.filter((r) => !VALID_ROLES.includes(r));
    if (invalid.length > 0) {
      return res.status(400).json({ message: `Invalid role(s): ${invalid.join(", ")}.` });
    }

    // De-duplicate
    roles = [...new Set(roles)];

    // Prevent an admin from removing their own admin role
    if (req.user._id.toString() === id && !roles.includes("admin")) {
      return res.status(400).json({ message: "Cannot revoke your own admin role." });
    }

    // Always ensure "user" is present (baseline role)
    if (!roles.includes("user")) roles.unshift("user");

    const user = await User.findByIdAndUpdate(
      id,
      { $set: { roles } },
      { new: true, select: "_id name email roles" }
    );

    if (!user) return res.status(404).json({ message: "User not found." });

    res.status(200).json({ message: "Roles updated.", user });
  } catch (error) {
    console.error("updateUserRoles error:", error);
    res.status(500).json({ message: "Failed to update roles." });
  }
};

module.exports = { getStats, getUsers, updateUserRoles };
