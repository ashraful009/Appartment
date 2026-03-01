const mongoose = require("mongoose");
const User = require("../models/User");
const PriceRequest = require("../models/PriceRequest");

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
    const totalSold = 0;

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
      .select("_id name email phone avatar roles createdAt")
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
// ─────────────────────────────────────────────
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

    if (req.user._id.toString() === id && !roles.includes("admin")) {
      return res.status(400).json({ message: "Cannot revoke your own admin role." });
    }

    if (!roles.includes("user")) roles.unshift("user");

    const user = await User.findByIdAndUpdate(
      id,
      { $set: { roles } },
      { new: true, select: "_id name email phone roles" }
    );

    if (!user) return res.status(404).json({ message: "User not found." });

    res.status(200).json({ message: "Roles updated.", user });
  } catch (error) {
    console.error("updateUserRoles error:", error);
    res.status(500).json({ message: "Failed to update roles." });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc   Get all pending (unassigned) price requests for admin to assign
// @route  GET /api/admin/requests/pending
// @access Private (admin)
// ─────────────────────────────────────────────────────────────────────────────
const getAdminPendingRequests = async (req, res) => {
  try {
    const requests = await PriceRequest.find({ status: "pending" })
      .populate("property", "name address mainImage")
      .populate("user", "name phone")
      .sort({ createdAt: -1 });

    res.status(200).json({ requests });
  } catch (error) {
    console.error("getAdminPendingRequests error:", error);
    res.status(500).json({ message: "Failed to fetch pending requests." });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc   Get all sellers with their current active lead count
// @route  GET /api/admin/sellers-list
// @access Private (admin)
// ─────────────────────────────────────────────────────────────────────────────
const getSellersList = async (req, res) => {
  try {
    // Aggregation: find all sellers and count their active (non-closed) leads
    const sellers = await User.aggregate([
      // 1. Only seller-role users
      { $match: { roles: "seller" } },

      // 2. Lookup their currently active assigned leads
      {
        $lookup: {
          from: "pricerequests",
          let: { sellerId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$assignedTo", "$$sellerId"] },
                conversionStatus: { $nin: ["approved", "rejected"] },
              },
            },
            { $count: "total" },
          ],
          as: "activeLeads",
        },
      },

      // 3. Shape output: name, id, currentLeadCount
      {
        $project: {
          _id: 1,
          name: 1,
          email: 1,
          phone: 1,
          currentLeadCount: {
            $ifNull: [{ $arrayElemAt: ["$activeLeads.total", 0] }, 0],
          },
        },
      },

      // 4. Sort: sellers with fewest leads first (to assist load-balancing)
      { $sort: { currentLeadCount: 1, name: 1 } },
    ]);

    res.status(200).json({ sellers });
  } catch (error) {
    console.error("getSellersList error:", error);
    res.status(500).json({ message: "Failed to fetch sellers list." });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc   Admin assigns a pending request to a seller
// @route  PUT /api/admin/requests/:id/assign
// @access Private (admin)
// Body:   { sellerId }
// ─────────────────────────────────────────────────────────────────────────────
const assignRequest = async (req, res) => {
  try {
    const { sellerId } = req.body;

    if (!sellerId) {
      return res.status(400).json({ message: "sellerId is required." });
    }

    // Verify the seller exists and has the seller role
    const seller = await User.findOne({ _id: sellerId, roles: "seller" }).select("_id name");
    if (!seller) {
      return res.status(404).json({ message: "Seller not found." });
    }

    const request = await PriceRequest.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          status: "assigned",
          assignedTo: sellerId,
          assignedAt: new Date(),
        },
      },
      { new: true }
    ).populate("property", "name address mainImage").populate("user", "name phone");

    if (!request) {
      return res.status(404).json({ message: "Request not found." });
    }

    res.status(200).json({
      message: `Lead successfully assigned to ${seller.name}.`,
      request,
    });
  } catch (error) {
    console.error("assignRequest error:", error);
    res.status(500).json({ message: "Failed to assign request." });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc   Get seller-by-seller performance with pending conversion details
// @route  GET /api/admin/sellers-performance
// @access Private (admin)
// ─────────────────────────────────────────────────────────────────────────────
const getSellersPerformance = async (req, res) => {
  try {
    const results = await PriceRequest.aggregate([
      // 1. Only assigned requests (leads sellers own)
      { $match: { assignedTo: { $exists: true, $ne: null } } },

      // 2. Group by seller — count approved & pending (customer + seller), collect all pending IDs
      {
        $group: {
          _id: "$assignedTo",
          approvedCount: {
            $sum: { $cond: [{ $eq: ["$conversionStatus", "approved"] }, 1, 0] },
          },
          pendingCount: {
            // Total pending = customer pending + seller pending
            $sum: {
              $cond: [
                {
                  $or: [
                    { $eq: ["$conversionStatus", "pending_approval"] },
                    { $eq: ["$sellerConversionStatus", "pending_approval"] },
                  ],
                },
                1, 0,
              ],
            },
          },
          pendingRequestIds: {
            $push: {
              $cond: [
                {
                  $or: [
                    { $eq: ["$conversionStatus", "pending_approval"] },
                    { $eq: ["$sellerConversionStatus", "pending_approval"] },
                  ],
                },
                "$_id",
                "$$REMOVE",
              ],
            },
          },
        },
      },

      // 3. Lookup seller info
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "seller",
        },
      },
      { $unwind: { path: "$seller", preserveNullAndEmptyArrays: true } },

      // 4. Lookup the actual pending PriceRequest documents with nested populates
      {
        $lookup: {
          from: "pricerequests",
          let: { ids: "$pendingRequestIds" },
          pipeline: [
            { $match: { $expr: { $in: ["$_id", "$$ids"] } } },
            {
              $lookup: {
                from: "users",
                localField: "user",
                foreignField: "_id",
                as: "user",
              },
            },
            { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
            {
              $lookup: {
                from: "properties",
                localField: "property",
                foreignField: "_id",
                as: "property",
              },
            },
            { $unwind: { path: "$property", preserveNullAndEmptyArrays: true } },
            {
              $project: {
                _id: 1,
                conversionStatus: 1,
                sellerConversionStatus: 1,
                createdAt: 1,
                "user._id": 1,
                "user.name": 1,
                "user.email": 1,
                "user.phone": 1,
                "property._id": 1,
                "property.name": 1,
                "property.address": 1,
              },
            },
          ],
          as: "pendingRequests",
        },
      },

      // 5. Shape final output
      {
        $project: {
          _id: 0,
          seller: {
            _id: "$seller._id",
            name: "$seller.name",
            email: "$seller.email",
            phone: "$seller.phone",
          },
          approvedCount: 1,
          pendingCount: 1,
          pendingRequests: 1,
        },
      },

      { $sort: { pendingCount: -1, approvedCount: -1 } },
    ]);

    res.status(200).json({ sellers: results });
  } catch (error) {
    console.error("getSellersPerformance error:", error);
    res.status(500).json({ message: "Failed to fetch seller performance data." });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc   Get total pending conversion count (notification badge)
// @route  GET /api/admin/conversion-stats
// @access Private (admin)
// ─────────────────────────────────────────────────────────────────────────────
const getConversionStats = async (req, res) => {
  try {
    const [customerPendingCount, sellerPendingCount] = await Promise.all([
      PriceRequest.countDocuments({ conversionStatus: "pending_approval" }),
      PriceRequest.countDocuments({ sellerConversionStatus: "pending_approval" }),
    ]);

    const totalPending = customerPendingCount + sellerPendingCount;

    res.status(200).json({ customerPendingCount, sellerPendingCount, totalPending });
  } catch (error) {
    console.error("getConversionStats error:", error);
    res.status(500).json({ message: "Failed to fetch conversion stats." });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc   Approve a conversion — atomically promotes user to 'customer' role
// @route  PUT /api/admin/requests/:id/approve-conversion
// @access Private (admin)
// ─────────────────────────────────────────────────────────────────────────────
const approveConversion = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    let updatedRequest;

    await session.withTransaction(async () => {
      updatedRequest = await PriceRequest.findByIdAndUpdate(
        req.params.id,
        { $set: { conversionStatus: "approved" } },
        { new: true, session }
      );

      if (!updatedRequest) throw new Error("Request not found.");

      const userUpdate = await User.findByIdAndUpdate(
        updatedRequest.user,
        { $addToSet: { roles: "customer" } },
        { new: true, session }
      );

      if (!userUpdate) throw new Error("Associated user not found.");
    });

    res.status(200).json({
      message: "Conversion approved. User has been granted the 'customer' role.",
      request: updatedRequest,
    });
  } catch (error) {
    console.error("approveConversion error:", error);
    const statusCode = error.message.includes("not found") ? 404 : 500;
    res.status(statusCode).json({ message: error.message || "Failed to approve conversion." });
  } finally {
    await session.endSession();
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc   Reject a conversion request
// @route  PUT /api/admin/requests/:id/reject-conversion
// @access Private (admin)
// ─────────────────────────────────────────────────────────────────────────────
const rejectConversion = async (req, res) => {
  try {
    const request = await PriceRequest.findByIdAndUpdate(
      req.params.id,
      { $set: { conversionStatus: "rejected" } },
      { new: true }
    );

    if (!request) return res.status(404).json({ message: "Request not found." });

    res.status(200).json({ message: "Conversion request rejected.", request });
  } catch (error) {
    console.error("rejectConversion error:", error);
    res.status(500).json({ message: "Failed to reject conversion." });
  }
};

// ───────────────────────────────────────────────────────────────────────────────
// @desc   Reject a seller promotion request
// @route  PUT /api/admin/requests/:id/reject-seller-conversion
// @access Private (admin)
// ───────────────────────────────────────────────────────────────────────────────
const rejectSellerConversion = async (req, res) => {
  try {
    const request = await PriceRequest.findByIdAndUpdate(
      req.params.id,
      { $set: { sellerConversionStatus: "rejected" } },
      { new: true }
    );
    if (!request) return res.status(404).json({ message: "Request not found." });
    res.status(200).json({ message: "Seller conversion request rejected.", request });
  } catch (error) {
    console.error("rejectSellerConversion error:", error);
    res.status(500).json({ message: "Failed to reject seller conversion." });
  }
};

// ───────────────────────────────────────────────────────────────────────────────
// @desc   Comprehensive seller analytics — 3 datasets in one call
// @route  GET /api/admin/seller-analytics
// @access Private (admin)
// ───────────────────────────────────────────────────────────────────────────────
const getSellerAnalytics = async (req, res) => {
  try {
    const now = new Date();
    const thisYear = now.getFullYear();

    // ── Date ranges ────────────────────────────────────────────────────
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 1);
    const yearStart = new Date(thisYear, 0, 1);
    const yearEnd = new Date(thisYear + 1, 0, 1);

    const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // Run all 3 aggregations in parallel
    const [lastMonthRaw, yearlyRaw, allSellersRaw] = await Promise.all([

      // ── Dataset 1: Last month's top 10 by conversion ratio ─────────────
      PriceRequest.aggregate([
        {
          $match: {
            assignedTo: { $ne: null },
            assignedAt: { $gte: lastMonthStart, $lt: lastMonthEnd },
          },
        },
        {
          $group: {
            _id: "$assignedTo",
            totalAssigned: { $sum: 1 },
            totalApproved: {
              $sum: { $cond: [{ $eq: ["$conversionStatus", "approved"] }, 1, 0] },
            },
          },
        },
        {
          $addFields: {
            ratio: {
              $cond: [
                { $gt: ["$totalAssigned", 0] },
                { $divide: ["$totalApproved", "$totalAssigned"] },
                0,
              ],
            },
          },
        },
        { $sort: { ratio: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "seller",
          },
        },
        { $unwind: "$seller" },
        {
          $project: {
            _id: 0,
            name: "$seller.name",
            phone: "$seller.phone",
            avatar: "$seller.avatar",
            totalAssigned: 1,
            totalApproved: 1,
            ratio: { $round: ["$ratio", 2] },
          },
        },
      ]),

      // ── Dataset 2: Monthly approved conversions for current year ─────────
      PriceRequest.aggregate([
        {
          $match: {
            conversionStatus: "approved",
            updatedAt: { $gte: yearStart, $lt: yearEnd },
          },
        },
        {
          $group: {
            _id: { $month: "$updatedAt" },
            conversions: { $sum: 1 },
          },
        },
        { $sort: { "_id": 1 } },
      ]),

      // ── Dataset 3: All sellers with stats sorted by ratio ──────────────
      User.aggregate([
        { $match: { roles: "seller" } },
        {
          $lookup: {
            from: "pricerequests",
            let: { sellerId: "$_id" },
            pipeline: [
              { $match: { $expr: { $eq: ["$assignedTo", "$$sellerId"] } } },
              {
                $group: {
                  _id: null,
                  totalAssigned: { $sum: 1 },
                  totalApproved: {
                    $sum: { $cond: [{ $eq: ["$conversionStatus", "approved"] }, 1, 0] },
                  },
                },
              },
            ],
            as: "stats",
          },
        },
        {
          $addFields: {
            totalAssigned: { $ifNull: [{ $arrayElemAt: ["$stats.totalAssigned", 0] }, 0] },
            totalApproved: { $ifNull: [{ $arrayElemAt: ["$stats.totalApproved", 0] }, 0] },
          },
        },
        {
          $addFields: {
            ratio: {
              $cond: [
                { $gt: ["$totalAssigned", 0] },
                { $round: [{ $divide: ["$totalApproved", "$totalAssigned"] }, 2] },
                0,
              ],
            },
          },
        },
        { $sort: { ratio: -1, totalApproved: -1 } },
        {
          $project: {
            _id: 1,
            name: 1,
            phone: 1,
            avatar: 1,
            totalAssigned: 1,
            totalApproved: 1,
            ratio: 1,
          },
        },
      ]),
    ]);

    // Shape Dataset 2 into a full 12-month array (fill missing months with 0)
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

// ───────────────────────────────────────────────────────────────────────────────
// @desc   Admin approves seller conversion — atomically grants user 'seller' role
// @route  PUT /api/admin/requests/:id/approve-seller-conversion
// @access Private (admin)
// ───────────────────────────────────────────────────────────────────────────────
const approveSellerConversion = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    let updatedRequest;

    await session.withTransaction(async () => {
      updatedRequest = await PriceRequest.findByIdAndUpdate(
        req.params.id,
        { $set: { sellerConversionStatus: "approved" } },
        { new: true, session }
      );

      if (!updatedRequest) throw new Error("Request not found.");

      // Grant 'seller' role AND link them to the seller who converted them
      // Setting referredBy = assignedTo unifies the referral + conversion systems,
      // so this user automatically appears in the converter's /api/seller/my-team
      const userUpdate = await User.findByIdAndUpdate(
        updatedRequest.user,
        {
          $addToSet: { roles: "seller" },
          $set: { referredBy: updatedRequest.assignedTo },
        },
        { new: true, session }
      );

      if (!userUpdate) throw new Error("Associated user not found.");
    });

    res.status(200).json({
      message: "Seller conversion approved. User has been granted the 'seller' role.",
      request: updatedRequest,
    });
  } catch (error) {
    console.error("approveSellerConversion error:", error);
    const statusCode = error.message.includes("not found") ? 404 : 500;
    res.status(statusCode).json({ message: error.message || "Failed to approve seller conversion." });
  } finally {
    await session.endSession();
  }
};

module.exports = {
  getStats,
  getUsers,
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
