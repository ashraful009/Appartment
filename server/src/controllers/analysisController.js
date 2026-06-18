const Membership = require("../models/Membership");
const InvestmentLedger = require("../models/InvestmentLedger");
const ApartmentUnit = require("../models/ApartmentUnit");
const Property = require("../models/Property");

// @desc    Get memberships for analysis with ledger and unit details
// @route   GET /api/management/analysis/memberships?processFilter=
// @access  Private (Management, Admin)
const getAnalysisMemberships = async (req, res) => {
  try {
    const { processFilter } = req.query;

    const memberships = await Membership.find({
      status: { $in: ["member", "investor"] },
    })
      .populate("userId", "name email phone profilePhoto")
      .populate("propertyId", "name mainImage address");

    const mIds = memberships.map((m) => m._id);

    const ledger = await InvestmentLedger.find({ membershipId: { $in: mIds } })
      .populate("audit.accountant.by", "name")
      .populate("audit.dataEntry.by", "name")
      .populate("audit.management.by", "name")
      .sort({ dueDate: 1, createdAt: 1 });

    const userIds = memberships.map((m) => m.userId?._id).filter(Boolean);
    const units = await ApartmentUnit.find({ allocatedTo: { $in: userIds } })
      .populate("propertyId", "name");

    const unitMap = {};
    for (const u of units) {
      if (u.allocatedTo && u.propertyId) {
        const key = `${u.allocatedTo.toString()}_${u.propertyId._id.toString()}`;
        unitMap[key] = {
          unitId: u._id,
          unitName: u.unitName,
          floor: u.floor,
          columnLine: u.columnLine,
          building: u.propertyId.name || "—",
          buildingId: u.propertyId._id,
          handoverMonth: u.handoverMonth,
          handoverYear: u.handoverYear,
          status: u.status,
        };
      }
    }

    const ledgerByMembership = {};
    for (const e of ledger) {
      const key = e.membershipId.toString();
      (ledgerByMembership[key] ||= []).push(e);
    }

    const startOfPrevMonth = new Date();
    startOfPrevMonth.setMonth(startOfPrevMonth.getMonth() - 1);
    startOfPrevMonth.setDate(1);
    startOfPrevMonth.setHours(0, 0, 0, 0);

    const endOfCurrentMonth = new Date();
    endOfCurrentMonth.setMonth(endOfCurrentMonth.getMonth() + 1);
    endOfCurrentMonth.setDate(0);
    endOfCurrentMonth.setHours(23, 59, 59, 999);

    let result = memberships.map((m) => {
      const entries = ledgerByMembership[m._id.toString()] || [];
      const uId = m.userId?._id?.toString() || m.userId?.toString() || "";
      const pId = m.propertyId?._id?.toString() || m.propertyId?.toString() || "";
      const key = uId && pId ? `${uId}_${pId}` : "";

      const processRangeEntries = entries.filter((e) => {
        if (e.status === "Paid") return false;
        if (!e.dueDate) return false;
        const d = new Date(e.dueDate);
        return d >= startOfPrevMonth && d <= endOfCurrentMonth;
      });

      return {
        _id: m._id,
        userId: m.userId,
        propertyId: m.propertyId,
        status: m.status,
        shares: m.shares,
        totalApprovedPaid: m.totalApprovedPaid,
        allocatedUnit: key ? unitMap[key] || null : null,
        ledger: entries,
        hasUnpaidInProcessRange: processRangeEntries.length > 0,
        unpaidCountInRange: processRangeEntries.length,
      };
    });

    if (processFilter === "true") {
      result = result.filter((m) => m.hasUnpaidInProcessRange);
    }

    res.status(200).json(result);
  } catch (error) {
    console.error("getAnalysisMemberships error:", error);
    res.status(500).json({ message: "Server error fetching memberships for analysis." });
  }
};

// @desc    Extend payment due date
// @route   PUT /api/management/analysis/ledger/:id/extend
// @access  Private (Management, Admin)
const extendDueDate = async (req, res) => {
  try {
    const { newDueDate } = req.body;
    if (!newDueDate) {
      return res.status(400).json({ message: "newDueDate is required." });
    }

    const entry = await InvestmentLedger.findById(req.params.id);
    if (!entry) {
      return res.status(404).json({ message: "Payment entry not found." });
    }

    entry.dueDate = new Date(newDueDate);
    await entry.save();

    res.status(200).json({ message: "Due date extended successfully.", entry });
  } catch (error) {
    console.error("extendDueDate error:", error);
    res.status(500).json({ message: "Server error extending due date." });
  }
};

// @desc    Reset a payment entry back to Unpaid status
// @route   PUT /api/management/analysis/ledger/:id/reset
// @access  Private (Management, Admin)
const resetLedgerEntry = async (req, res) => {
  try {
    const entry = await InvestmentLedger.findById(req.params.id);
    if (!entry) {
      return res.status(404).json({ message: "Payment entry not found." });
    }

    entry.status = "Unpaid";
    entry.paymentMethod = null;
    entry.paymentDetails = {};
    entry.invoiceUrl = "";
    entry.description = "";
    entry.batchId = null;
    entry.submittedAt = null;
    entry.audit = { accountant: {}, dataEntry: {}, management: {} };
    await entry.save();

    if (entry.type === "downpayment") {
      const membership = await Membership.findById(entry.membershipId);
      if (membership) {
        membership.status = "member";
        membership.installmentsGenerated = false;
        membership.downPaymentCompletedAt = null;
        await membership.save();

        // Delete all installments for this membership
        await InvestmentLedger.deleteMany({
          membershipId: membership._id,
          type: "installment"
        });

        // Revert user role if no other membership is investor
        const User = require("../models/User");
        const user = await User.findById(membership.userId);
        if (user) {
          const { removeRole, addRole } = require("../services/membershipService");
          const otherInvestorCount = await Membership.countDocuments({
            userId: membership.userId,
            _id: { $ne: membership._id },
            status: "investor",
          });
          if (otherInvestorCount === 0) {
            removeRole(user, "Investor");
            addRole(user, "member");
            await user.save();
          }
        }
      }
    }

    res.status(200).json({ message: "Payment entry reset back to Unpaid.", entry });
  } catch (error) {
    console.error("resetLedgerEntry error:", error);
    res.status(500).json({ message: "Server error resetting payment entry." });
  }
};

// @desc    Update handover time for allocated unit
// @route   PUT /api/management/analysis/unit/:unitId/handover
// @access  Private (Management, Admin)
const updateHandoverTime = async (req, res) => {
  try {
    const { handoverMonth, handoverYear } = req.body;
    const month = Number(handoverMonth);
    const year = Number(handoverYear);

    if (!Number.isInteger(month) || month < 1 || month > 12) {
      return res.status(400).json({ message: "Select a valid handover month (1-12)." });
    }
    if (!Number.isInteger(year) || year < 2000 || year > 2100) {
      return res.status(400).json({ message: "Select a valid handover year (2000-2100)." });
    }

    const unit = await ApartmentUnit.findById(req.params.unitId);
    if (!unit) {
      return res.status(404).json({ message: "Unit not found." });
    }

    unit.handoverMonth = month;
    unit.handoverYear = year;
    await unit.save();

    res.status(200).json({ message: "Handover time updated successfully.", unit });
  } catch (error) {
    console.error("updateHandoverTime error:", error);
    res.status(500).json({ message: "Server error updating handover time." });
  }
};

// @desc    Get properties list (Ongoing & Upcoming) for allocation filter
// @route   GET /api/management/analysis/properties
// @access  Private (Management, Admin)
const getPropertiesForAnalysis = async (req, res) => {
  try {
    const properties = await Property.find({
      status: { $in: ["Ongoing", "Upcoming"] },
    })
      .select("name address mainImage status")
      .sort({ displayOrder: 1, name: 1 });

    res.status(200).json({ properties });
  } catch (error) {
    console.error("getPropertiesForAnalysis error:", error);
    res.status(500).json({ message: "Server error fetching properties for analysis." });
  }
};

module.exports = {
  getAnalysisMemberships,
  extendDueDate,
  resetLedgerEntry,
  updateHandoverTime,
  getPropertiesForAnalysis,
};
