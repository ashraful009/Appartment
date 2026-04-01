const PriceRequest = require("../models/PriceRequest");
const Interaction = require("../models/Interaction");
const PaymentPlan = require("../models/PaymentPlan");
const ApartmentUnit = require("../models/ApartmentUnit");

/**
 * GET /api/customer/overview
 * Unified aggregation endpoint for the Customer Dashboard.
 * Returns activeRequestsCount, savedPropertiesCount, and upcomingMeeting
 * in a single request to minimise frontend API calls.
 *
 * @protected — requires a valid JWT session (protect middleware)
 */
const getCustomerOverview = async (req, res) => {
  try {
    const userId = req.user._id;

    // ── 1. Active Requests & 2. Saved Properties (run in parallel) ────────
    // savedPropertiesCount is read directly from the user document that the
    // protect middleware already fetched — no extra DB round-trip needed.
    const [activeRequestsCount, userLeadIds] = await Promise.all([
      PriceRequest.countDocuments({ user: userId }),
      PriceRequest.find({ user: userId }).select("_id").lean(),
    ]);

    const savedPropertiesCount = req.user.wishlist?.length ?? 0;

    // ── 3. Upcoming Meeting ────────────────────────────────────────────────
    // Find the next scheduled (Pending) follow-up across all leads owned by
    // this user, populated with property title for display purposes.
    let upcomingMeeting = null;

    if (userLeadIds.length > 0) {
      const leadObjectIds = userLeadIds.map((doc) => doc._id);

      upcomingMeeting = await Interaction.findOne({
        leadId: { $in: leadObjectIds },
        nextMeetingDate: { $gt: new Date() },
        followUpStatus: "Pending",
      })
        .sort({ nextMeetingDate: 1 })
        .limit(1)
        .populate({
          path: "leadId",
          select: "property pipelineStage priority",
          populate: {
            path: "property",
            select: "title location",
          },
        })
        .populate({
          path: "sellerId",
          select: "name phone profilePhoto",
        })
        .lean();
    }

    // ── Response ───────────────────────────────────────────────────────────
    res.status(200).json({
      success: true,
      data: {
        activeRequestsCount,
        savedPropertiesCount,
        upcomingMeeting,
      },
    });
  } catch (error) {
    console.error("getCustomerOverview error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch customer overview.",
    });
  }
};

/**
 * GET /api/customer/journey
 * Fetches the customer's full property journey in a single request:
 *  - inquiries: all PriceRequests raised by this user (with property + assigned seller)
 *  - payments:  all PaymentPlans associated with this user (with property summary)
 *
 * @protected — requires a valid JWT session (protect middleware)
 */
const getCustomerJourney = async (req, res) => {
  try {
    const userId = req.user._id;

    // Run both queries in parallel to minimise response time
    const [inquiries, payments] = await Promise.all([
      // ── Inquiries (PriceRequests) ──────────────────────────────────────
      PriceRequest.find({ user: userId })
        .sort({ createdAt: -1 })
        .populate({
          path: "property",
          select: "name mainImage address",
        })
        .populate({
          path: "assignedTo",
          select: "name phone email profilePhoto",
        })
        .lean(),

      // ── Payments (PaymentPlans) ────────────────────────────────────────
      PaymentPlan.find({ customerId: userId })
        .sort({ createdAt: -1 })
        .populate({
          path: "propertyId",
          select: "name mainImage",
        })
        .lean(),
    ]);

    res.status(200).json({
      success: true,
      data: { inquiries, payments },
    });
  } catch (error) {
    console.error("getCustomerJourney error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch customer journey.",
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc   Get all units booked/sold under the logged-in customer's account
// @route  GET /api/customer/my-units
// @access Private (customer — matched via customerId on ApartmentUnit)
// ─────────────────────────────────────────────────────────────────────────────
const getMyUnits = async (req, res) => {
  try {
    const units = await ApartmentUnit.find({ customerId: req.user._id })
      .populate("propertyId", "name address mainImage description totalUnits floors handoverTime landSize parkingArea")
      .populate("actionBy",   "name roles phone")
      .sort({ updatedAt: -1 })       // latest bookings first
      .lean();

    res.status(200).json({ success: true, units });
  } catch (error) {
    console.error("getMyUnits error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch your units." });
  }
};

module.exports = { getCustomerOverview, getCustomerJourney, getMyUnits };
