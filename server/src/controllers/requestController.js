const PriceRequest = require("../models/PriceRequest");
const User         = require("../models/User");

// ─────────────────────────────────────────────────────────────
// @desc   Create a new price request (Customer)
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

    // ── Auto-claim via Referral Code ────────────────────────────────────────
    // Fetch the full requesting user to read their referralCode field
    const requestingUser = await User.findById(req.user._id).select("referralCode");
    let autoClaimedBy = null;

    if (requestingUser?.referralCode) {
      // referralCode is stored as a seller's _id string — validate it's a valid ObjectId
      const mongoose = require("mongoose");
      const isValidId = mongoose.Types.ObjectId.isValid(requestingUser.referralCode);

      if (isValidId) {
        // Confirm the referenced user actually exists and holds the "seller" role
        const seller = await User.findOne({
          _id: requestingUser.referralCode,
          roles: "seller",
        }).select("_id");

        if (seller) {
          autoClaimedBy = seller._id;
        }
      }
    }

    const requestData = {
      property:  propertyId,
      user:      req.user._id,
      status:    autoClaimedBy ? "claimed" : "pending",
      claimedBy: autoClaimedBy,
    };

    const request = await PriceRequest.create(requestData);

    const message = autoClaimedBy
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
// @desc   Get stats — pending count + seller's claimed count
// @route  GET /api/requests/stats
// @access Private (admin or seller)
// ─────────────────────────────────────────────────────────────
const getStats = async (req, res) => {
  try {
    const [pendingCount, myClaimedCount] = await Promise.all([
      PriceRequest.countDocuments({ status: "pending" }),
      PriceRequest.countDocuments({ claimedBy: req.user._id }),
    ]);

    res.status(200).json({ pendingCount, myClaimedCount });
  } catch (error) {
    console.error("getStats error:", error);
    res.status(500).json({ message: "Failed to fetch stats." });
  }
};

// ─────────────────────────────────────────────────────────────
// @desc   Get all pending requests (Seller — shows name only)
// @route  GET /api/requests/pending
// @access Private (seller / admin)
// ─────────────────────────────────────────────────────────────
const getPendingRequests = async (req, res) => {
  try {
    const requests = await PriceRequest.find({ status: "pending" })
      .populate("property", "name address mainImage")
      .populate("user", "name")          // only name — no phone/email revealed here
      .sort({ createdAt: -1 });

    res.status(200).json({ requests });
  } catch (error) {
    console.error("getPendingRequests error:", error);
    res.status(500).json({ message: "Failed to fetch pending requests." });
  }
};

// ─────────────────────────────────────────────────────────────
// @desc   Claim a pending request (Seller)
// @route  PUT /api/requests/:id/claim
// @access Private (seller / admin)
// ─────────────────────────────────────────────────────────────
const claimRequest = async (req, res) => {
  try {
    const request = await PriceRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Request not found." });
    }
    if (request.status === "claimed") {
      return res.status(400).json({ message: "This request has already been claimed." });
    }

    request.status    = "claimed";
    request.claimedBy = req.user._id;
    await request.save();

    res.status(200).json({ message: "Request claimed successfully.", request });
  } catch (error) {
    console.error("claimRequest error:", error);
    res.status(500).json({ message: "Failed to claim request." });
  }
};

// ─────────────────────────────────────────────────────────────
// @desc   Get This Seller's claimed requests (full contact info)
// @route  GET /api/requests/claimed
// @access Private (seller / admin)
// ─────────────────────────────────────────────────────────────
const getClaimedRequests = async (req, res) => {
  try {
    const requests = await PriceRequest.find({ claimedBy: req.user._id })
      .populate("property", "name address mainImage")
      .populate("user", "name email phone")   // full contact now unlocked
      .sort({ updatedAt: -1 });

    res.status(200).json({ requests });
  } catch (error) {
    console.error("getClaimedRequests error:", error);
    res.status(500).json({ message: "Failed to fetch claimed requests." });
  }
};

module.exports = {
  createRequest,
  getStats,
  getPendingRequests,
  claimRequest,
  getClaimedRequests,
};
