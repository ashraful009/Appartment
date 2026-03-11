const PriceRequest  = require("../models/PriceRequest");
const Interaction   = require("../models/Interaction");
const Notification  = require("../models/Notification");
const User          = require("../models/User");

// ─────────────────────────────────────────────────────────────
// @desc   Delegate a lead from a parent seller to a sub-seller
// @route  PUT /api/requests/:id/delegate
// @access Private (seller)
// ─────────────────────────────────────────────────────────────
const delegateLead = async (req, res) => {
  try {
    const { targetSellerId } = req.body;
    if (!targetSellerId) {
      return res.status(400).json({ message: "targetSellerId is required." });
    }

    // 1. Confirm the current user owns this lead
    const lead = await PriceRequest.findOne({
      _id:        req.params.id,
      assignedTo: req.user._id,
    }).populate("user", "name");

    if (!lead) {
      return res.status(404).json({ message: "Lead not found or not assigned to you." });
    }

    // 2. Confirm the target seller is a direct sub-seller of this user
    const subSeller = await User.findOne({
      _id:        targetSellerId,
      referredBy: req.user._id,
      roles:      "seller",
    }).select("name _id");

    if (!subSeller) {
      return res.status(403).json({
        message: "Target seller must be one of your direct sub-sellers.",
      });
    }

    // 3. Reassign the lead
    lead.assignedTo = subSeller._id;
    lead.assignedAt = new Date();
    await lead.save();

    // 4. Auto-log an interaction for the record
    await Interaction.create({
      leadId:          lead._id,
      sellerId:        req.user._id,
      interactionType: "Note",
      notes:           `Lead delegated to sub-seller: ${subSeller.name}.`,
      adminNote:       `Delegated by parent seller on ${new Date().toLocaleDateString("en-GB")}.`,
    });

    // 5. Notify the sub-seller
    await Notification.create({
      recipientId: subSeller._id,
      senderId:    req.user._id,
      message:     `A lead has been delegated to you by your mentor.`,
      type:        "LeadDelegated",
    });

    res.status(200).json({
      message: `Lead successfully delegated to ${subSeller.name}.`,
      lead,
    });
  } catch (error) {
    console.error("delegateLead error:", error);
    res.status(500).json({ message: "Failed to delegate lead." });
  }
};

// ─────────────────────────────────────────────────────────────
// @desc   Get team overview + earnings for a parent seller
// @route  GET /api/seller/team-overview
// @access Private (seller)
// ─────────────────────────────────────────────────────────────
const COMMISSION_PER_CONVERSION = 5000;

const getTeamOverview = async (req, res) => {
  try {
    const mongoose = require("mongoose");
    const parentId = new mongoose.Types.ObjectId(req.user._id);

    const team = await User.aggregate([
      // 1. Match sub-sellers referred by this seller
      {
        $match: {
          referredBy: parentId,
          roles:      "seller",
        },
      },

      // 2. Join with pricerequests assigned to each sub-seller
      {
        $lookup: {
          from:         "pricerequests",
          localField:   "_id",
          foreignField: "assignedTo",
          as:           "leads",
        },
      },

      // 3. Populate each lead's user info
      {
        $lookup: {
          from:         "users",
          localField:   "leads.user",
          foreignField: "_id",
          as:           "leadUsers",
        },
      },

      // 4. Compute stats
      {
        $addFields: {
          totalLeads: { $size: "$leads" },
          convertedLeads: {
            $size: {
              $filter: {
                input: "$leads",
                as:    "l",
                cond:  { $eq: ["$$l.conversionStatus", "approved"] },
              },
            },
          },
        },
      },

      // 5. Project
      {
        $project: {
          _id:            1,
          name:           1,
          phone:          1,
          totalLeads:     1,
          convertedLeads: 1,
          leads:          1,   // full lead list for read-only expansion
        },
      },
    ]);

    // Total approved conversions across all sub-sellers
    const totalConversions  = team.reduce((sum, s) => sum + s.convertedLeads, 0);
    const totalTeamEarnings = totalConversions * COMMISSION_PER_CONVERSION;

    res.status(200).json({ team, totalConversions, totalTeamEarnings });
  } catch (error) {
    console.error("getTeamOverview error:", error);
    res.status(500).json({ message: "Failed to fetch team overview." });
  }
};

// ─────────────────────────────────────────────────────────────
// @desc   Broadcast a message to all sub-sellers
// @route  POST /api/seller/broadcast
// @access Private (seller)
// ─────────────────────────────────────────────────────────────
const broadcastToTeam = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message?.trim()) {
      return res.status(400).json({ message: "Broadcast message is required." });
    }

    // Find all sub-sellers referred by this user
    const subSellers = await User.find({
      referredBy: req.user._id,
      roles:      "seller",
    }).select("_id");

    if (!subSellers.length) {
      return res.status(200).json({ message: "No sub-sellers to broadcast to.", sent: 0 });
    }

    // Bulk-create one notification per sub-seller
    const notifications = subSellers.map((s) => ({
      recipientId: s._id,
      senderId:    req.user._id,
      message:     message.trim(),
      type:        "Broadcast",
    }));

    await Notification.insertMany(notifications);

    res.status(201).json({
      message: `Broadcast sent to ${subSellers.length} sub-seller(s).`,
      sent:    subSellers.length,
    });
  } catch (error) {
    console.error("broadcastToTeam error:", error);
    res.status(500).json({ message: "Failed to broadcast message." });
  }
};

module.exports = { delegateLead, getTeamOverview, broadcastToTeam };
