const PriceRequest = require("../models/PriceRequest");
const Property     = require("../models/Property");

// ─────────────────────────────────────────────────────────────
// @desc   Get all price requests for short-term installment properties
// @route  GET /api/admin/short-term-requests
// @access Private (admin)
// ─────────────────────────────────────────────────────────────
const getShortTermRequests = async (req, res) => {
  try {
    // Step 1: Find all property IDs that are Short-term
    const shortTermPropertyIds = await Property.find(
      { installmentType: "Short-term" },
      { _id: 1 }
    ).lean();

    const propertyIds = shortTermPropertyIds.map((p) => p._id);

    if (propertyIds.length === 0) {
      return res.status(200).json({ success: true, requests: [] });
    }

    // Step 2: Find all PriceRequests for those properties
    const requests = await PriceRequest.find({ property: { $in: propertyIds } })
      .populate("property", "name address mainImage installmentType status")
      .populate("user", "name email phone")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, requests });
  } catch (error) {
    console.error("getShortTermRequests error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch short-term requests." });
  }
};

module.exports = {
  getShortTermRequests,
};
