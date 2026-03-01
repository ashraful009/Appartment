const PriceRequest = require("../models/PriceRequest");
const User         = require("../models/User");

// ─────────────────────────────────────────────────────────────
// @desc   Create a new price request
// @route  POST /api/requests
// @access Private (any authenticated user)
// ─────────────────────────────────────────────────────────────
const createRequest = async (req, res) => {
  try {
    const { propertyId } = req.body;
    if (!propertyId) {
      return res.status(400).json({ message: "propertyId is required." });
    }

    // Prevent duplicate: same user requesting the same property twice
    const existing = await PriceRequest.findOne({
      property: propertyId,
      user: req.user._id,
    });
    if (existing) {
      return res
        .status(409)
        .json({ message: "You have already requested pricing for this property." });
    }

    // ── Auto-Assign via Referral Code ───────────────────────────────────────
    // If the requesting user registered with a seller's referral code,
    // automatically assign this lead to that seller.
    const requestingUser = await User.findById(req.user._id).select("referralCode");
    let autoAssignedTo = null;

    if (requestingUser?.referralCode) {
      const mongoose = require("mongoose");
      const isValidId = mongoose.Types.ObjectId.isValid(requestingUser.referralCode);

      if (isValidId) {
        const seller = await User.findOne({
          _id: requestingUser.referralCode,
          roles: "seller",
        }).select("_id");

        if (seller) {
          autoAssignedTo = seller._id;
        }
      }
    }

    const requestData = {
      property: propertyId,
      user: req.user._id,
      status: autoAssignedTo ? "assigned" : "pending",
      assignedTo: autoAssignedTo,
      assignedAt: autoAssignedTo ? new Date() : null,
    };

    const request = await PriceRequest.create(requestData);

    const message = autoAssignedTo
      ? "Price request submitted and automatically assigned to your referral seller."
      : "Price request submitted successfully.";

    res.status(201).json({ message, request });
  } catch (error) {
    console.error("createRequest error:", error);
    if (error.code === 11000) {
      return res
        .status(409)
        .json({ message: "You have already requested pricing for this property." });
    }
    res.status(500).json({ message: "Failed to submit request." });
  }
};

// ─────────────────────────────────────────────────────────────
// @desc   Get stats — pending count + seller's assigned count
// @route  GET /api/requests/stats
// @access Private (admin or seller)
// ─────────────────────────────────────────────────────────────
const getStats = async (req, res) => {
  try {
    const [pendingCount, myAssignedCount] = await Promise.all([
      PriceRequest.countDocuments({ status: "pending" }),
      PriceRequest.countDocuments({ assignedTo: req.user._id }),
    ]);

    res.status(200).json({ pendingCount, myAssignedCount });
  } catch (error) {
    console.error("getStats error:", error);
    res.status(500).json({ message: "Failed to fetch stats." });
  }
};

// ─────────────────────────────────────────────────────────────
// @desc   Get this seller's assigned leads (full contact info)
// @route  GET /api/requests/assigned
// @access Private (seller)
// ─────────────────────────────────────────────────────────────
const getAssignedRequests = async (req, res) => {
  try {
    const requests = await PriceRequest.find({ assignedTo: req.user._id })
      .populate("property", "name address mainImage")
      .populate("user", "name email phone")
      .sort({ assignedAt: -1, updatedAt: -1 });

    res.status(200).json({ requests });
  } catch (error) {
    console.error("getAssignedRequests error:", error);
    res.status(500).json({ message: "Failed to fetch assigned leads." });
  }
};

// ─────────────────────────────────────────────────────────────
// @desc   Seller requests conversion of an assigned lead to customer
// @route  PUT /api/requests/:id/request-conversion
// @access Private (seller only)
// ─────────────────────────────────────────────────────────────
const requestConversion = async (req, res) => {
  try {
    // Security: find only if this seller is assigned to the request
    const request = await PriceRequest.findOne({
      _id: req.params.id,
      assignedTo: req.user._id,
    });

    if (!request) {
      return res.status(404).json({
        message: "Request not found or you do not have permission to convert it.",
      });
    }

    if (request.conversionStatus !== "none") {
      return res.status(400).json({
        message: `Conversion already ${request.conversionStatus}. Cannot re-submit.`,
      });
    }

    request.conversionStatus = "pending_approval";
    await request.save();

    res.status(200).json({
      message: "Conversion request submitted. Awaiting admin approval.",
      request,
    });
  } catch (error) {
    console.error("requestConversion error:", error);
    res.status(500).json({ message: "Failed to submit conversion request." });
  }
};

module.exports = {
  createRequest,
  getStats,
  getAssignedRequests,
  requestConversion,
};
