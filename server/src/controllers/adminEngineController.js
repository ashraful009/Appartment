const PriceRequest = require("../models/PriceRequest");
const Target       = require("../models/Target");

// ─────────────────────────────────────────────────────────────
// @desc   Get idle leads (assigned but no interaction > 7 days)
// @route  GET /api/admin/idle-leads
// @access Private (admin)
// ─────────────────────────────────────────────────────────────
const getIdleLeads = async (req, res) => {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const idleLeads = await PriceRequest.find({
      assignedTo:          { $ne: null, $exists: true },
      lastInteractionDate: { $lt: sevenDaysAgo },
    })
      .populate("assignedTo", "name phone email")
      .populate("user",       "name phone email")
      .sort({ lastInteractionDate: 1 });   // oldest first = most urgent

    res.status(200).json({
      count: idleLeads.length,
      idleLeads,
    });
  } catch (error) {
    console.error("getIdleLeads error:", error);
    res.status(500).json({ message: "Failed to fetch idle leads." });
  }
};

// ─────────────────────────────────────────────────────────────
// @desc   Set / upsert the monthly target
// @route  POST /api/admin/targets
// @access Private (admin)
// ─────────────────────────────────────────────────────────────
const setMonthlyTarget = async (req, res) => {
  try {
    const { month, year, globalTarget } = req.body;

    if (!month || !year || globalTarget === undefined) {
      return res.status(400).json({ message: "month, year, and globalTarget are required." });
    }
    if (isNaN(Number(globalTarget)) || Number(globalTarget) < 0) {
      return res.status(400).json({ message: "globalTarget must be a non-negative number." });
    }

    // Upsert: create or overwrite the record for this month+year
    const target = await Target.findOneAndUpdate(
      { month, year: Number(year) },
      { globalTarget: Number(globalTarget) },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({ message: "Monthly target saved.", target });
  } catch (error) {
    console.error("setMonthlyTarget error:", error);
    res.status(500).json({ message: "Failed to save monthly target." });
  }
};

// ─────────────────────────────────────────────────────────────
// @desc   Get the current active month's target (public to all sellers)
// @route  GET /api/targets/current
// @access Private (seller / admin)
// ─────────────────────────────────────────────────────────────
const getCurrentTarget = async (req, res) => {
  try {
    const now   = new Date();
    const month = now.toLocaleString("en-US", { month: "long" }); // e.g. "March"
    const year  = now.getFullYear();

    const target = await Target.findOne({ month, year });

    if (!target) {
      return res.status(200).json({
        message: "No target set for this month.",
        target:  null,
        month,
        year,
      });
    }

    res.status(200).json({ target, month, year });
  } catch (error) {
    console.error("getCurrentTarget error:", error);
    res.status(500).json({ message: "Failed to fetch current target." });
  }
};

module.exports = { getIdleLeads, setMonthlyTarget, getCurrentTarget };
