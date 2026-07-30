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

    const profileData = { 
      ...user,
      profilePhoto: user.profile_photo || user.profilePhoto,
      referralCode: user.referral_code || user.referralCode,
      socialLinks: typeof user.social_links === 'string' ? JSON.parse(user.social_links) : user.social_links || user.socialLinks,
    };

    
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

    const fieldMap = {
      name: "name",
      phone: "phone",
      profile_photo: "profile_photo",
      profilePhoto: "profile_photo",
      address: "address",
      occupation: "occupation",
      preferred_contact_time: "preferred_contact_time",
      preferredContactTime: "preferred_contact_time",
      bio: "bio",
      social_links: "social_links",
      socialLinks: "social_links",
      expertise: "expertise",
    };

    const updateData = {};
    for (const [incomingKey, dbColumn] of Object.entries(fieldMap)) {
      if (req.body[incomingKey] !== undefined) {
        updateData[dbColumn] = req.body[incomingKey];
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

    updatedUser.profilePhoto = updatedUser.profile_photo;
    updatedUser.referralCode = updatedUser.referral_code;
    updatedUser.socialLinks  = typeof updatedUser.social_links === 'string' ? JSON.parse(updatedUser.social_links) : updatedUser.social_links;

    res.status(200).json({
      message: "Profile updated successfully.",
      user: updatedUser,
    });
  } catch (error) {
    console.error("UpdateProfile error:", error);
    res.status(500).json({ message: "Server error updating profile." });
  }
};

const uploadAvatarController = async (req, res) => {
  try {
    if (!req.file || (!req.file.path && !req.file.secure_url)) {
      return res.status(400).json({ message: "No avatar image file provided." });
    }
    const avatarUrl = req.file.path || req.file.secure_url;
    res.status(200).json({ url: avatarUrl, message: "Avatar uploaded successfully." });
  } catch (error) {
    console.error("uploadAvatarController error:", error);
    res.status(500).json({ message: "Failed to upload avatar." });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  uploadAvatarController,
};
