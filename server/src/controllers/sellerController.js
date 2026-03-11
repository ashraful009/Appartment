const PriceRequest = require("../models/PriceRequest");
const User         = require("../models/User");

// ─────────────────────────────────────────────────────────────────────────────
// @desc   Seller requests conversion of an assigned lead to a seller (affiliate)
// @route  PUT /api/requests/:id/request-seller-conversion
// @access Private (seller)
// ─────────────────────────────────────────────────────────────────────────────
const requestSellerConversion = async (req, res) => {
  try {
    // Security: only the assigned seller can initiate this
    const request = await PriceRequest.findOne({
      _id:        req.params.id,
      assignedTo: req.user._id,
    });

    if (!request) {
      return res.status(404).json({
        message: "Request not found or you do not have permission.",
      });
    }

    if (request.sellerConversionStatus !== "none") {
      return res.status(400).json({
        message: `Seller conversion already ${request.sellerConversionStatus}. Cannot re-submit.`,
      });
    }

    request.sellerConversionStatus = "pending_approval";
    await request.save();

    res.status(200).json({
      message: "Seller conversion request submitted. Awaiting admin approval.",
      request,
    });
  } catch (error) {
    console.error("requestSellerConversion error:", error);
    res.status(500).json({ message: "Failed to submit seller conversion request." });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc   Get the seller's sub-seller team (users they referred who became sellers)
// @route  GET /api/seller/my-team
// @access Private (seller)
// ─────────────────────────────────────────────────────────────────────────────
const getMyTeam = async (req, res) => {
  try {
    const mongoose = require("mongoose");

    const team = await User.aggregate([
      // 1. Match sub-sellers referred by this seller who have the 'seller' role
      {
        $match: {
          referredBy: new mongoose.Types.ObjectId(req.user._id),
          roles:      "seller",
        },
      },

      // 2. Join with pricerequests where assignedTo = this sub-seller's _id
      {
        $lookup: {
          from:         "pricerequests",
          localField:   "_id",
          foreignField: "assignedTo",
          as:           "leadData",
        },
      },

      // 3. Compute stats from the joined leadData array
      {
        $addFields: {
          totalAssigned: { $size: "$leadData" },
          totalConverted: {
            $size: {
              $filter: {
                input: "$leadData",
                as:    "lead",
                cond:  { $eq: ["$$lead.conversionStatus", "approved"] },
              },
            },
          },
        },
      },

      // 4. Project only the fields the frontend needs
      {
        $project: {
          _id:            1,
          name:           1,
          phone:          1,
          totalAssigned:  1,
          totalConverted: 1,
        },
      },
    ]);

    res.status(200).json({ team });
  } catch (error) {
    console.error("getMyTeam error:", error);
    res.status(500).json({ message: "Failed to fetch team data." });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc   Get seller's scheduled tasks (today + overdue follow-ups)
// @route  GET /api/seller/tasks
// @access Private (seller)
// ─────────────────────────────────────────────────────────────────────────────
const getSellerTasks = async (req, res) => {
  try {
    const Interaction = require("../models/Interaction");

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    // Find all interactions for this seller that have a nextMeetingDate set
    const allTasks = await Interaction.find({
      sellerId: req.user._id,
      nextMeetingDate: { $ne: null, $exists: true },
    })
      .populate({
        path: "leadId",
        select: "user",
        populate: { path: "user", select: "name phone" },
      })
      .sort({ nextMeetingDate: 1 });

    const todayTasks = allTasks.filter(t =>
      t.nextMeetingDate >= todayStart && t.nextMeetingDate <= todayEnd
    );
    const overdueTasks = allTasks.filter(t =>
      t.nextMeetingDate < todayStart
    );

    res.status(200).json({ todayTasks, overdueTasks });
  } catch (error) {
    console.error("getSellerTasks error:", error);
    res.status(500).json({ message: "Failed to fetch seller tasks." });
  }
};

module.exports = { requestSellerConversion, getMyTeam, getSellerTasks };

