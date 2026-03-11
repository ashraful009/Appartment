const User = require("../models/User");
const PriceRequest = require("../models/PriceRequest");

// @desc    Get user profile data (role-specific)
// @route   GET /api/users/profile
// @access  Private (protect)
const getProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch base user and populate wishlist if it exists
    const user = await User.findById(userId)
      .populate("wishlist")
      .populate("referredBy", "name email phone profilePhoto socialLinks"); // for seller mentor

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const profileData = user.toObject();

    // ── If user is a Customer ──
    if (user.roles.includes("customer")) {
      // Find the most recent active/pending PriceRequest to attach their Assigned Seller
      const recentRequest = await PriceRequest.findOne({
        user: userId,
        status: "assigned", // Only assigned requests have an active seller
      })
        .sort({ createdAt: -1 })
        .populate("assignedTo", "name email phone profilePhoto socialLinks bio expertise");

      if (recentRequest && recentRequest.assignedTo) {
        profileData.currentAssignedSeller = recentRequest.assignedTo;
      } else {
        profileData.currentAssignedSeller = null;
      }
    }

    // ── If user is a Seller ──
    if (user.roles.includes("seller")) {
      // Aggregate stats for this seller
      const [stats] = await PriceRequest.aggregate([
        { $match: { assignedTo: user._id } },
        {
          $group: {
            _id: null,
            totalAssignedLeads: { $sum: 1 },
            totalConvertedCustomers: {
              $sum: {
                $cond: [{ $eq: ["$conversionStatus", "approved"] }, 1, 0],
              },
            },
          },
        },
      ]);

      profileData.stats = {
        totalAssignedLeads: stats?.totalAssignedLeads || 0,
        totalConvertedCustomers: stats?.totalConvertedCustomers || 0,
      };
    }

    res.status(200).json({ user: profileData });
  } catch (error) {
    console.error("GetProfile error:", error);
    res.status(500).json({ message: "Server error fetching profile." });
  }
};

// @desc    Update user profile data (allowed fields only)
// @route   PUT /api/users/profile
// @access  Private (protect)
const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    // Allowed fields strictly filter out roles, email, etc.
    const allowedUpdates = [
      "name",
      "phone",
      "profilePhoto",
      "address",
      "occupation",
      "preferredContactTime",
      "bio",
      "socialLinks",
      "expertise",
    ];

    const updateData = {};
    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        const value = req.body[key];
        // Expand nested objects into dot-notation to avoid overwriting the
        // entire sub-document (e.g. use "address.present" not "address")
        if (value !== null && typeof value === "object" && !Array.isArray(value)) {
          for (const subKey of Object.keys(value)) {
            if (value[subKey] !== undefined) {
              updateData[`${key}.${subKey}`] = value[subKey];
            }
          }
        } else {
          updateData[key] = value;
        }
      }
    }

    // Use $set up to top level object (mongoose handles sub-docs like address automatically on $set if defined)
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate("wishlist")
      .populate("referredBy", "name email phone profilePhoto socialLinks");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Profile updated successfully.",
      user: updatedUser,
    });
  } catch (error) {
    console.error("UpdateProfile error:", error);
    res.status(500).json({ message: "Server error updating profile." });
  }
};

module.exports = {
  getProfile,
  updateProfile,
};
