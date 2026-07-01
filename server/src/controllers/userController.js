const userRepository = require("../repositories/UserRepository");
const priceRequestRepository = require("../repositories/PriceRequestRepository");

// @desc    Get user profile data (role-specific)
// @route   GET /api/users/profile
// @access  Private (protect)
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id; // updated from _id to id

    // Fetch base user
    const user = await userRepository.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Instead of populate, fetch related info manually for now
    // Fetch Wishlist
    const userWishlistRecords = await userRepository.db('user_wishlists')
      .where({ user_id: userId })
      .join('properties', 'user_wishlists.property_id', 'properties.id')
      .select('properties.*');
      
    user.wishlist = userWishlistRecords;

    // Fetch Referred By
    if (user.referred_by) {
      const referredBy = await userRepository.findById(user.referred_by, ['id', 'name', 'email', 'phone', 'profile_photo', 'social_links']);
      user.referredBy = referredBy;
    } else {
      user.referredBy = null;
    }

    const profileData = { ...user };

    // ── If user is a Customer ──
    if (user.roles.includes("customer")) {
      // Find the most recently updated active PriceRequest
      const recentRequest = await priceRequestRepository.db('price_requests')
        .where({ user_id: userId, status: 'assigned' })
        .whereNot({ pipeline_stage: 'Closed Lost' })
        .orderBy('updated_at', 'desc')
        .first();

      if (recentRequest && recentRequest.assigned_to) {
        const seller = await userRepository.findById(recentRequest.assigned_to, [
          'id', 'name', 'email', 'phone', 'profile_photo', 'bio', 'social_links', 'expertise'
        ]);
        profileData.currentAssignedSeller = seller;
      } else {
        profileData.currentAssignedSeller = null;
      }
    }

    // ── If user is a Seller ──
    if (user.roles.includes("seller")) {
      // Aggregate stats for this seller using Knex raw/builder
      const stats = await priceRequestRepository.db('price_requests')
        .where({ assigned_to: userId })
        .select(
          priceRequestRepository.db.raw('COUNT(id) as totalAssignedLeads'),
          priceRequestRepository.db.raw('SUM(CASE WHEN conversion_status = \'approved\' THEN 1 ELSE 0 END) as totalConvertedCustomers')
        )
        .first();

      profileData.stats = {
        totalAssignedLeads: parseInt(stats?.totalassignedleads || 0, 10),
        totalConvertedCustomers: parseInt(stats?.totalconvertedcustomers || 0, 10),
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
    const userId = req.user.id;

    // Allowed fields strictly filter out roles, email, etc.
    const allowedUpdates = [
      "name",
      "phone",
      "profile_photo",
      "address",
      "occupation",
      "preferred_contact_time",
      "bio",
      "social_links",
      "expertise",
    ];

    const updateData = {};
    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        const value = req.body[key];
        
        // Handling nested objects like address for JSONB in postgres
        if (value !== null && typeof value === "object" && !Array.isArray(value)) {
            // Since we are using JSONB we can merge the existing with new 
            // Actually, for simplicity we will just update the entire JSONB object if passed
            updateData[key] = value;
        } else {
          updateData[key] = value;
        }
      }
    }

    const updatedUser = await userRepository.update(userId, updateData);

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Append wishlist and referredBy for response similar to before
    const userWishlistRecords = await userRepository.db('user_wishlists')
      .where({ user_id: userId })
      .join('properties', 'user_wishlists.property_id', 'properties.id')
      .select('properties.*');
    updatedUser.wishlist = userWishlistRecords;

    if (updatedUser.referred_by) {
      updatedUser.referredBy = await userRepository.findById(updatedUser.referred_by, ['id', 'name', 'email', 'phone', 'profile_photo', 'social_links']);
    } else {
        updatedUser.referredBy = null;
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
