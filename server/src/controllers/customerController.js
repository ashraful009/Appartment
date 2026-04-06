const PriceRequest = require("../models/PriceRequest");
const Interaction  = require("../models/Interaction");
const PaymentPlan  = require("../models/PaymentPlan");
const ApartmentUnit = require("../models/ApartmentUnit");
const Installment  = require("../models/Installment");

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

// ─────────────────────────────────────────────────────────────────────────────
// @desc   Get all installments for a specific unit belonging to the customer
// @route  GET /api/customer/installments/:unitId
// @access Private (customer — must own the unit)
// ─────────────────────────────────────────────────────────────────────────────
const getInstallmentsByUnit = async (req, res) => {
  try {
    const { unitId } = req.params;
    const userId     = req.user._id;

    // Security: verify this unit actually belongs to the requesting customer
    const unit = await ApartmentUnit.findOne({ _id: unitId, customerId: userId }).lean();
    if (!unit) {
      return res.status(403).json({ success: false, message: "Unit not found or access denied." });
    }

    const installments = await Installment.find({ unitId })
      .sort({ invoiceDate: 1 })   // chronological order
      .lean();

    res.status(200).json({ success: true, installments });
  } catch (error) {
    console.error("getInstallmentsByUnit error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch installments." });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc   Submit payment proof for an installment
// @route  PUT /api/customer/installments/:id/pay
// @access Private (customer)
// ─────────────────────────────────────────────────────────────────────────────
const submitPaymentProof = async (req, res) => {
  try {
    const { id } = req.params;
    const { bankName, accountNumber } = req.body;
    let invoiceUrl = "";

    if (req.file) {
      invoiceUrl = req.file.path;
    }

    const installment = await Installment.findById(id);
    if (!installment) {
      return res.status(404).json({ success: false, message: "Installment not found" });
    }

    // Security verify
    if (installment.customerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    // Update details
    installment.paymentDetails = {
      bankName: bankName || "",
      accountNumber: accountNumber || "",
      invoiceUrl: invoiceUrl || installment.paymentDetails?.invoiceUrl,
    };
    installment.status = "Pending";
    
    await installment.save();

    res.status(200).json({ success: true, message: "Payment proof submitted successfully", installment });
  } catch (error) {
    console.error("submitPaymentProof error:", error);
    res.status(500).json({ success: false, message: "Failed to submit payment proof." });
  }
};

module.exports = { getCustomerOverview, getCustomerJourney, getMyUnits, getInstallmentsByUnit, submitPaymentProof };
