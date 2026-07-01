const userRepository = require("../repositories/UserRepository");
const priceRequestRepository = require("../repositories/PriceRequestRepository");
const { generateUniqueReferralCode } = require("../utils/referralCodeUtil");

const VALID_ROLES = ["user", "customer", "seller", "admin", "Director", "GM", "AGM", "Accountant", "DataEntry", "Management", "member", "Investor"];

const getStats = async (req, res) => {
  try {
    const totalUsersRec = await userRepository.db('users').count('id as count').first();
    const totalCustomersRec = await userRepository.db('users').whereRaw("'customer' = ANY(roles)").count('id as count').first();
    const totalSellersRec = await userRepository.db('users').whereRaw("'seller' = ANY(roles)").count('id as count').first();
    const totalSold = 0;

    res.status(200).json({ 
        totalUsers: parseInt(totalUsersRec.count, 10), 
        totalCustomers: parseInt(totalCustomersRec.count, 10), 
        totalSellers: parseInt(totalSellersRec.count, 10), 
        totalSold 
    });
  } catch (error) {
    console.error("getStats error:", error);
    res.status(500).json({ message: "Failed to fetch stats." });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await userRepository.db('users')
      .select('id as _id', 'name', 'email', 'phone', 'profile_photo as avatar', 'roles', 'created_at as createdAt')
      .orderBy('created_at', 'desc');

    res.status(200).json({ users });
  } catch (error) {
    console.error("getUsers error:", error);
    res.status(500).json({ message: "Failed to fetch users." });
  }
};

const getUserById = async (req, res) => {
  try {
    const userRaw = await userRepository.db('users')
      .where({ 'users.id': req.params.id })
      .leftJoin('users as referrers', 'users.referred_by', 'referrers.id')
      .select(
        'users.*',
        'referrers.id as referrerId', 'referrers.name as referrerName', 'referrers.email as referrerEmail', 'referrers.phone as referrerPhone'
      )
      .first();

    if (!userRaw) return res.status(404).json({ message: "User not found." });

    const user = { ...userRaw, _id: userRaw.id, avatar: userRaw.profile_photo, referredBy: null };
    delete user.password_hash;
    delete user.password;
    if (userRaw.referrerId) {
        user.referredBy = { _id: userRaw.referrerId, name: userRaw.referrerName, email: userRaw.referrerEmail, phone: userRaw.referrerPhone };
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error("getUserById error:", error);
    res.status(500).json({ message: "Failed to fetch user profile." });
  }
};

const updateUserRoles = async (req, res) => {
  try {
    const { id } = req.params;
    let { roles } = req.body;

    if (!Array.isArray(roles)) {
      return res.status(400).json({ message: "roles must be an array." });
    }

    const invalid = roles.filter((r) => !VALID_ROLES.includes(r));
    if (invalid.length > 0) {
      return res.status(400).json({ message: `Invalid role(s): ${invalid.join(", ")}.` });
    }

    roles = [...new Set(roles)];

    if (req.user.id.toString() === id && !roles.includes("admin")) {
      return res.status(400).json({ message: "Cannot revoke your own admin role." });
    }

    const ELEVATED_ROLES = ["admin", "seller", "customer", "Director", "GM", "AGM", "Accountant", "DataEntry", "Management", "member", "Investor"];
    const hasElevated = roles.some((r) => ELEVATED_ROLES.includes(r));
    if (hasElevated) {
      roles = roles.filter((r) => r !== "user");
    }
    if (roles.length === 0) roles = ["user"];


    const updatedUser = await userRepository.update(id, { roles });

    if (!updatedUser) return res.status(404).json({ message: "User not found." });

    const user = { _id: updatedUser.id, name: updatedUser.name, email: updatedUser.email, phone: updatedUser.phone, roles: updatedUser.roles };

    res.status(200).json({ message: "Roles updated.", user });
  } catch (error) {
    console.error("updateUserRoles error:", error);
    res.status(500).json({ message: "Failed to update roles." });
  }
};

const getAdminPendingRequests = async (req, res) => {
  try {
    const requestsRaw = await priceRequestRepository.db('price_requests')
      .where({ 'price_requests.status': "pending" })
      .leftJoin('properties', 'price_requests.property_id', 'properties.id')
      .leftJoin('users', 'price_requests.user_id', 'users.id')
      .orderBy('price_requests.created_at', 'desc')
      .select(
          'price_requests.*',
          'properties.id as propertyId', 'properties.name as propertyName', 'properties.address as propertyAddress', 'properties.main_image as propertyMainImage',
          'users.id as userId', 'users.name as userName', 'users.phone as userPhone'
      );

    const requests = requestsRaw.map(r => ({
        ...r,
        _id: r.id,
        property: { _id: r.propertyId, name: r.propertyName, address: r.propertyAddress, mainImage: r.propertyMainImage },
        user: { _id: r.userId, name: r.userName, phone: r.userPhone }
    }));

    res.status(200).json({ requests });
  } catch (error) {
    console.error("getAdminPendingRequests error:", error);
    res.status(500).json({ message: "Failed to fetch pending requests." });
  }
};

const getSellersList = async (req, res) => {
  try {
    const sellersRaw = await userRepository.db('users')
      .whereRaw("'seller' = ANY(roles)")
      .leftJoin('price_requests', function() {
          this.on('users.id', '=', 'price_requests.assigned_to')
              .andOnNotIn('price_requests.conversion_status', ['approved', 'rejected'])
      })
      .groupBy('users.id')
      .select(
          'users.id as _id', 'users.name', 'users.email', 'users.phone',
          userRepository.db.raw('COUNT(price_requests.id) as "currentLeadCount"')
      )
      .orderBy('currentLeadCount', 'asc')
      .orderBy('users.name', 'asc');

    const sellers = sellersRaw.map(s => ({
        ...s,
        currentLeadCount: parseInt(s.currentleadcount, 10) || 0
    }));

    res.status(200).json({ sellers });
  } catch (error) {
    console.error("getSellersList error:", error);
    res.status(500).json({ message: "Failed to fetch sellers list." });
  }
};

const assignRequest = async (req, res) => {
  try {
    const { sellerId } = req.body;

    if (!sellerId) {
      return res.status(400).json({ message: "sellerId is required." });
    }

    const seller = await userRepository.db('users').where({ id: sellerId }).whereRaw("'seller' = ANY(roles)").select('id as _id', 'name').first();
    if (!seller) {
      return res.status(404).json({ message: "Seller not found." });
    }

    const updatedReq = await priceRequestRepository.update(req.params.id, {
        status: "assigned",
        assigned_to: sellerId,
        assigned_at: new Date()
    });

    if (!updatedReq) {
      return res.status(404).json({ message: "Request not found." });
    }

    const requestRaw = await priceRequestRepository.db('price_requests')
        .where({ 'price_requests.id': updatedReq.id })
        .leftJoin('properties', 'price_requests.property_id', 'properties.id')
        .leftJoin('users', 'price_requests.user_id', 'users.id')
        .select(
          'price_requests.*',
          'properties.id as propertyId', 'properties.name as propertyName', 'properties.address as propertyAddress', 'properties.main_image as propertyMainImage',
          'users.id as userId', 'users.name as userName', 'users.phone as userPhone'
        ).first();

    const request = {
        ...requestRaw,
        _id: requestRaw.id,
        property: { _id: requestRaw.propertyId, name: requestRaw.propertyName, address: requestRaw.propertyAddress, mainImage: requestRaw.propertyMainImage },
        user: { _id: requestRaw.userId, name: requestRaw.userName, phone: requestRaw.userPhone }
    };

    res.status(200).json({
      message: `Lead successfully assigned to ${seller.name}.`,
      request,
    });
  } catch (error) {
    console.error("assignRequest error:", error);
    res.status(500).json({ message: "Failed to assign request." });
  }
};

const getSellersPerformance = async (req, res) => {
  try {
    const resultsRaw = await priceRequestRepository.db('price_requests')
      .whereNotNull('assigned_to')
      .leftJoin('users as seller', 'price_requests.assigned_to', 'seller.id')
      .groupBy('assigned_to', 'seller.id', 'seller.name', 'seller.email', 'seller.phone')
      .select(
          'assigned_to',
          'seller.id as sellerId', 'seller.name as sellerName', 'seller.email as sellerEmail', 'seller.phone as sellerPhone',
          priceRequestRepository.db.raw(`SUM(CASE WHEN price_requests.conversion_status = 'approved' THEN 1 ELSE 0 END) as "approvedCount"`),
          priceRequestRepository.db.raw(`SUM(CASE WHEN price_requests.conversion_status = 'pending_approval' OR price_requests.seller_conversion_status = 'pending_approval' THEN 1 ELSE 0 END) as "pendingCount"`),
          priceRequestRepository.db.raw(`array_agg(price_requests.id) FILTER (WHERE price_requests.conversion_status = 'pending_approval' OR price_requests.seller_conversion_status = 'pending_approval') as "pendingRequestIds"`)
      )
      .orderBy('pendingCount', 'desc')
      .orderBy('approvedCount', 'desc');

    const results = await Promise.all(resultsRaw.map(async (row) => {
        const pendingIds = row.pendingrequestids || [];
        let pendingRequests = [];
        
        if (pendingIds.length > 0) {
            const prs = await priceRequestRepository.db('price_requests')
                .whereIn('price_requests.id', pendingIds)
                .leftJoin('users', 'price_requests.user_id', 'users.id')
                .leftJoin('properties', 'price_requests.property_id', 'properties.id')
                .select(
                    'price_requests.id as _id', 'price_requests.conversion_status as conversionStatus', 'price_requests.seller_conversion_status as sellerConversionStatus', 'price_requests.created_at as createdAt',
                    'users.id as userId', 'users.name as userName', 'users.email as userEmail', 'users.phone as userPhone',
                    'properties.id as propertyId', 'properties.name as propertyName', 'properties.address as propertyAddress'
                );
            pendingRequests = prs.map(pr => ({
                _id: pr._id, conversionStatus: pr.conversionStatus, sellerConversionStatus: pr.sellerConversionStatus, createdAt: pr.createdAt,
                user: { _id: pr.userId, name: pr.userName, email: pr.userEmail, phone: pr.userPhone },
                property: { _id: pr.propertyId, name: pr.propertyName, address: pr.propertyAddress }
            }));
        }

        return {
            seller: { _id: row.sellerid, name: row.sellername, email: row.selleremail, phone: row.sellerphone },
            approvedCount: parseInt(row.approvedcount, 10),
            pendingCount: parseInt(row.pendingcount, 10),
            pendingRequests
        };
    }));

    res.status(200).json({ sellers: results });
  } catch (error) {
    console.error("getSellersPerformance error:", error);
    res.status(500).json({ message: "Failed to fetch seller performance data." });
  }
};

const getConversionStats = async (req, res) => {
  try {
    const customerPendingCountRec = await priceRequestRepository.db('price_requests').where({ conversion_status: "pending_approval" }).count('id as count').first();
    const sellerPendingCountRec = await priceRequestRepository.db('price_requests').where({ seller_conversion_status: "pending_approval" }).count('id as count').first();

    const customerPendingCount = parseInt(customerPendingCountRec.count, 10);
    const sellerPendingCount = parseInt(sellerPendingCountRec.count, 10);
    const totalPending = customerPendingCount + sellerPendingCount;

    res.status(200).json({ customerPendingCount, sellerPendingCount, totalPending });
  } catch (error) {
    console.error("getConversionStats error:", error);
    res.status(500).json({ message: "Failed to fetch conversion stats." });
  }
};

const approveConversion = async (req, res) => {
  try {
    const updatedRequest = await priceRequestRepository.update(req.params.id, { conversion_status: "approved" });
    if (!updatedRequest) throw new Error("Request not found.");

    const user = await userRepository.findById(updatedRequest.user_id, ['roles']);
    if (!user) throw new Error("Associated user not found.");

    const updatedRoles = [...new Set([...(user.roles || []), "customer"])].filter(r => r !== "user");
    await userRepository.update(user.id, { roles: updatedRoles });

    res.status(200).json({
      message: "Conversion approved. User has been granted the 'customer' role.",
      request: { ...updatedRequest, _id: updatedRequest.id, conversionStatus: updatedRequest.conversion_status },
    });
  } catch (error) {
    console.error("approveConversion error:", error);
    const statusCode = error.message.includes("not found") ? 404 : 500;
    res.status(statusCode).json({ message: error.message || "Failed to approve conversion." });
  }
};

const rejectConversion = async (req, res) => {
  try {
    const request = await priceRequestRepository.update(req.params.id, { conversion_status: "rejected" });
    if (!request) return res.status(404).json({ message: "Request not found." });

    res.status(200).json({ message: "Conversion request rejected.", request: { ...request, _id: request.id, conversionStatus: request.conversion_status } });
  } catch (error) {
    console.error("rejectConversion error:", error);
    res.status(500).json({ message: "Failed to reject conversion." });
  }
};

const rejectSellerConversion = async (req, res) => {
  try {
    const request = await priceRequestRepository.update(req.params.id, { seller_conversion_status: "rejected" });
    if (!request) return res.status(404).json({ message: "Request not found." });
    
    res.status(200).json({ message: "Seller conversion request rejected.", request: { ...request, _id: request.id, sellerConversionStatus: request.seller_conversion_status } });
  } catch (error) {
    console.error("rejectSellerConversion error:", error);
    res.status(500).json({ message: "Failed to reject seller conversion." });
  }
};

const getSellerAnalytics = async (req, res) => {
  try {
    const now = new Date();
    const thisYear = now.getFullYear();

    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 1);
    const yearStart = new Date(thisYear, 0, 1);
    const yearEnd = new Date(thisYear + 1, 0, 1);

    const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const lastMonthRawQ = await priceRequestRepository.db('price_requests')
        .whereNotNull('assigned_to')
        .where('assigned_at', '>=', lastMonthStart)
        .where('assigned_at', '<', lastMonthEnd)
        .leftJoin('users as seller', 'price_requests.assigned_to', 'seller.id')
        .groupBy('assigned_to', 'seller.name', 'seller.phone', 'seller.profile_photo')
        .select(
            'assigned_to',
            'seller.name as name', 'seller.phone as phone', 'seller.profile_photo as avatar',
            priceRequestRepository.db.raw(`COUNT(price_requests.id) as totalAssigned`),
            priceRequestRepository.db.raw(`SUM(CASE WHEN price_requests.conversion_status = 'approved' THEN 1 ELSE 0 END) as totalApproved`)
        );
        
    const lastMonthRaw = lastMonthRawQ.map(r => {
        const assigned = parseInt(r.totalassigned, 10);
        const approved = parseInt(r.totalapproved, 10);
        const ratio = assigned > 0 ? (approved / assigned) : 0;
        return {
            name: r.name, phone: r.phone, avatar: r.avatar,
            totalAssigned: assigned, totalApproved: approved, ratio: Math.round(ratio * 100) / 100
        };
    }).sort((a, b) => b.ratio - a.ratio).slice(0, 10);

    const yearlyRawQ = await priceRequestRepository.db('price_requests')
        .where({ conversion_status: "approved" })
        .where('updated_at', '>=', yearStart)
        .where('updated_at', '<', yearEnd)
        .select(priceRequestRepository.db.raw(`EXTRACT(MONTH FROM updated_at) as month`))
        .count('id as conversions')
        .groupByRaw(`EXTRACT(MONTH FROM updated_at)`)
        .orderBy('month', 'asc');
        
    const yearlyRaw = yearlyRawQ.map(r => ({
        _id: parseInt(r.month, 10),
        conversions: parseInt(r.conversions, 10)
    }));

    const allSellersRawQ = await userRepository.db('users')
        .whereRaw("'seller' = ANY(roles)")
        .leftJoin('price_requests', 'users.id', 'price_requests.assigned_to')
        .groupBy('users.id', 'users.name', 'users.phone', 'users.profile_photo')
        .select(
            'users.id as _id', 'users.name', 'users.phone', 'users.profile_photo as avatar',
            userRepository.db.raw(`COUNT(price_requests.id) as totalAssigned`),
            userRepository.db.raw(`SUM(CASE WHEN price_requests.conversion_status = 'approved' THEN 1 ELSE 0 END) as totalApproved`)
        );
        
    const allSellersRaw = allSellersRawQ.map(r => {
        const assigned = parseInt(r.totalassigned, 10);
        const approved = parseInt(r.totalapproved, 10);
        const ratio = assigned > 0 ? (approved / assigned) : 0;
        return {
            _id: r._id, name: r.name, phone: r.phone, avatar: r.avatar,
            totalAssigned: assigned, totalApproved: approved, ratio: Math.round(ratio * 100) / 100
        };
    }).sort((a, b) => {
        if (b.ratio !== a.ratio) return b.ratio - a.ratio;
        return b.totalApproved - a.totalApproved;
    });

    const yearlyChartData = MONTH_NAMES.map((month, idx) => {
      const found = yearlyRaw.find((r) => r._id === idx + 1);
      return { month, conversions: found ? found.conversions : 0 };
    });

    res.status(200).json({
      lastMonthTop10: lastMonthRaw,
      yearlyChartData,
      allSellersList: allSellersRaw,
    });
  } catch (error) {
    console.error("getSellerAnalytics error:", error);
    res.status(500).json({ message: "Failed to fetch seller analytics." });
  }
};

const approveSellerConversion = async (req, res) => {
  try {
    const updatedRequest = await priceRequestRepository.update(req.params.id, { seller_conversion_status: "approved" });
    if (!updatedRequest) throw new Error("Request not found.");

    const newReferralCode = await generateUniqueReferralCode();

    const user = await userRepository.findById(updatedRequest.user_id, ['roles']);
    if (!user) throw new Error("Associated user not found.");

    const updatedRoles = [...new Set([...(user.roles || []), "seller"])];
    
    await userRepository.update(user.id, {
      roles: updatedRoles,
      referred_by: updatedRequest.assigned_to,
      referral_code: newReferralCode
    });

    res.status(200).json({
      message: "Seller conversion approved. User has been granted the 'seller' role.",
      request: { ...updatedRequest, _id: updatedRequest.id, sellerConversionStatus: updatedRequest.seller_conversion_status },
    });
  } catch (error) {
    console.error("approveSellerConversion error:", error);
    const statusCode = error.message.includes("not found") ? 404 : 500;
    res.status(statusCode).json({ message: error.message || "Failed to approve seller conversion." });
  }
};

module.exports = {
  getStats,
  getUsers,
  getUserById,
  updateUserRoles,
  getAdminPendingRequests,
  getSellersList,
  assignRequest,
  getSellersPerformance,
  getConversionStats,
  approveConversion,
  rejectConversion,
  rejectSellerConversion,
  getSellerAnalytics,
  approveSellerConversion,
};
