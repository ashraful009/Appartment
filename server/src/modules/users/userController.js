const userRepository = require("../../repositories/UserRepository");
const priceRequestRepository = require("../../repositories/PriceRequestRepository");
const { pick } = require("../../utils/dbUtils");




const getProfile = async (req, res) => {
  try {
    const userId = req.user.id; 

    
    const user = await userRepository.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    
    
    const userWishlistRecords = await userRepository.db('user_wishlists')
      .where({ user_id: userId })
      .join('properties', 'user_wishlists.property_id', 'properties.id')
      .select('properties.*');
      
    user.wishlist = userWishlistRecords;

    
    if (user.referred_by) {
      const referredBy = await userRepository.findById(user.referred_by, ['id', 'name', 'email', 'phone', 'profile_photo', 'social_links']);
      user.referredBy = referredBy;
    } else {
      user.referredBy = null;
    }

    const profileData = { ...user };

    
    if (user.roles.includes("customer")) {
      
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

    
    if (user.roles.includes("seller")) {
      
      const stats = await priceRequestRepository.db('price_requests')
        .where({ assigned_to: userId })
        .select(
          priceRequestRepository.db.raw('COUNT(id) as totalAssignedLeads'),
          priceRequestRepository.db.raw('SUM(CASE WHEN conversion_status = \'approved\' THEN 1 ELSE 0 END) as totalConvertedCustomers')
        )
        .first();

      profileData.stats = {
        totalAssignedLeads: parseInt(pick(stats, 'totalAssignedLeads', 'totalassignedleads') || 0, 10),
        totalConvertedCustomers: parseInt(pick(stats, 'totalConvertedCustomers', 'totalconvertedcustomers') || 0, 10),
      };
    }

    res.status(200).json({ user: profileData });
  } catch (error) {
    console.error("GetProfile error:", error);
    res.status(500).json({ message: "Server error fetching profile." });
  }
};




const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    
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
        
        
        if (value !== null && typeof value === "object" && !Array.isArray(value)) {
            
            
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
