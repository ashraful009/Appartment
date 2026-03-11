const PriceRequest = require("../models/PriceRequest");
const User         = require("../models/User");
const crypto = require("crypto");

// ─────────────────────────────────────────────────────────────
// @desc   Create a new price request (supports authenticated users AND guests)
// @route  POST /api/requests
// @access Public (optionalAuth middleware — guests allowed)
// ─────────────────────────────────────────────────────────────
const createRequest = async (req, res) => {
  try {
    const { propertyId } = req.body;
    if (!propertyId) {
      return res.status(400).json({ message: "propertyId is required." });
    }

    let resolvedUserId;
    let autoAssignedTo = null;

    // ── PATH A: Authenticated User ──────────────────────────────────────────
    if (req.user) {
      resolvedUserId = req.user._id;

      // Auto-Assign via Referral Code
      const requestingUser = await User.findById(req.user._id).select("referredBy");
      if (requestingUser?.referredBy) {
        const seller = await User.findOne({
          _id: requestingUser.referredBy,
          roles: "seller",
        }).select("_id");
        if (seller) autoAssignedTo = seller._id;
      }
    }

    // ── PATH B: Guest (unauthenticated) ─────────────────────────────────────
    else {
      const { name, email, phone } = req.body;

      // Validate required guest fields
      if (!name || !email || !phone) {
        return res.status(400).json({
          message: "Guest requests require name, email, and phone.",
        });
      }

      // Find an existing user by email OR phone
      let guestUser = await User.findOne({ $or: [{ email }, { phone }] });

      if (!guestUser) {
        // Create a shadow guest account
        // The pre-save bcrypt hook will hash this random password automatically.
        const randomPassword = crypto.randomBytes(8).toString("hex"); // 16-char hex string

        guestUser = await User.create({
          name,
          email: email.toLowerCase().trim(),
          phone,
          password: randomPassword,
          roles: ["customer"],
          isGuest: true,
        });
      }

      resolvedUserId = guestUser._id;
    }

    // ── Duplicate Check ─────────────────────────────────────────────────────
    const existing = await PriceRequest.findOne({
      property: propertyId,
      user: resolvedUserId,
    });
    if (existing) {
      return res
        .status(409)
        .json({ message: "You have already requested pricing for this property." });
    }

    // ── Create the PriceRequest ─────────────────────────────────────────────
    const requestData = {
      property: propertyId,
      user: resolvedUserId,
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

// ─────────────────────────────────────────────────────────────
// @desc   Update pipeline stage, priority, and client preferences
// @route  PUT /api/requests/:id/pipeline
// @access Private (seller)
// ─────────────────────────────────────────────────────────────
const updatePipeline = async (req, res) => {
  try {
    const { pipelineStage, priority, clientPreferences } = req.body;

    // Security: only the assigned seller can update pipeline
    const request = await PriceRequest.findOne({
      _id: req.params.id,
      assignedTo: req.user._id,
    });

    if (!request) {
      return res.status(404).json({ message: "Request not found or you do not have permission." });
    }

    if (pipelineStage) request.pipelineStage = pipelineStage;
    if (priority) request.priority = priority;
    if (clientPreferences) {
      request.clientPreferences = {
        ...request.clientPreferences,
        ...clientPreferences,
      };
    }

    await request.save();

    res.status(200).json({ message: "Pipeline updated successfully.", request });
  } catch (error) {
    console.error("updatePipeline error:", error);
    res.status(500).json({ message: "Failed to update pipeline." });
  }
};

module.exports = {
  createRequest,
  getStats,
  getAssignedRequests,
  requestConversion,
  updatePipeline,
};

