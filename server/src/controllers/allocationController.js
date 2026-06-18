const Property      = require("../models/Property");
const ApartmentUnit = require("../models/ApartmentUnit");
const Membership    = require("../models/Membership");

// ─────────────────────────────────────────────────────────────────────────────
// @desc    All buildings with per-status unit counts (available/booked/sold)
// @route   GET /api/management/buildings
// @access  Private (Management, Admin)
// ─────────────────────────────────────────────────────────────────────────────
const getBuildings = async (req, res) => {
  try {
    const properties = await Property.find({})
      .sort({ displayOrder: 1, name: 1 })
      .select("name address mainImage totalUnits");

    const counts = await ApartmentUnit.aggregate([
      { $group: { _id: { propertyId: "$propertyId", status: "$status" }, c: { $sum: 1 } } },
    ]);

    const countMap = {};
    for (const row of counts) {
      const key = row._id.propertyId?.toString();
      if (!key) continue;
      (countMap[key] ||= { available: 0, booked: 0, sold: 0, total: 0 });
      if (row._id.status === "Unsold") countMap[key].available += row.c;
      else if (row._id.status === "Booked") countMap[key].booked += row.c;
      else if (row._id.status === "Sold") countMap[key].sold += row.c;
      countMap[key].total += row.c;
    }

    const result = properties.map((p) => ({
      ...p.toObject(),
      counts: countMap[p._id.toString()] || { available: 0, booked: 0, sold: 0, total: 0 },
    }));

    res.status(200).json(result);
  } catch (error) {
    console.error("getBuildings error:", error);
    res.status(500).json({ message: "Server error fetching buildings." });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    All units of a building (with allocation info)
// @route   GET /api/management/buildings/:id/units
// @access  Private (Management, Admin)
// ─────────────────────────────────────────────────────────────────────────────
const getBuildingUnits = async (req, res) => {
  try {
    const units = await ApartmentUnit.find({ propertyId: req.params.id })
      .populate("allocatedTo", "name email phone")
      .sort({ floor: 1, columnLine: 1 })
      .select("unitName floor columnLine status allocatedTo handoverMonth handoverYear");

    res.status(200).json(units);
  } catch (error) {
    console.error("getBuildingUnits error:", error);
    res.status(500).json({ message: "Server error fetching units." });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Investor list with their currently-allocated unit (if any)
// @route   GET /api/management/investors
// @access  Private (Management, Admin)
// ─────────────────────────────────────────────────────────────────────────────
const getInvestors = async (req, res) => {
  try {
    const memberships = await Membership.find({ status: "investor" })
      .populate("userId", "name email phone profilePhoto")
      .sort({ updatedAt: -1 });

    const userIds = memberships.map((m) => m.userId?._id).filter(Boolean);
    const allocated = await ApartmentUnit.find({ allocatedTo: { $in: userIds } })
      .populate("propertyId", "name");

    const allocMap = {};
    for (const u of allocated) {
      if (u.allocatedTo && u.propertyId) {
        const key = `${u.allocatedTo.toString()}_${u.propertyId._id.toString()}`;
        allocMap[key] = {
          unitId: u._id,
          unitName: u.unitName,
          floor: u.floor,
          building: u.propertyId.name || "—",
          buildingId: u.propertyId._id,
          handoverMonth: u.handoverMonth,
          handoverYear: u.handoverYear,
        };
      }
    }

    const result = memberships.map((m) => {
      const uId = m.userId?._id?.toString() || m.userId?.toString() || "";
      const pId = m.propertyId?._id?.toString() || m.propertyId?.toString() || "";
      const key = uId && pId ? `${uId}_${pId}` : "";
      return {
        _id: m._id,
        userId: m.userId,
        shares: m.shares,
        totalApprovedPaid: m.totalApprovedPaid,
        propertyId: m.propertyId,
        allocatedUnit: key ? allocMap[key] || null : null,
      };
    });

    res.status(200).json(result);
  } catch (error) {
    console.error("getInvestors error:", error);
    res.status(500).json({ message: "Server error fetching investors." });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Allocate an available unit to an investor (with handover month/year)
// @route   POST /api/management/allocate
// @access  Private (Management, Admin)
//          body: { unitId, investorId, handoverMonth, handoverYear }
// ─────────────────────────────────────────────────────────────────────────────
const allocateUnit = async (req, res) => {
  try {
    const { unitId, investorId, handoverMonth, handoverYear } = req.body;
    if (!unitId || !investorId) {
      return res.status(400).json({ message: "unitId and investorId are required." });
    }

    const month = Number(handoverMonth);
    const year = Number(handoverYear);
    if (!Number.isInteger(month) || month < 1 || month > 12) {
      return res.status(400).json({ message: "Select a valid handover month." });
    }
    if (!Number.isInteger(year) || year < 2000 || year > 2100) {
      return res.status(400).json({ message: "Select a valid handover year." });
    }

    const unit = await ApartmentUnit.findById(unitId);
    if (!unit) return res.status(404).json({ message: "Unit not found." });
    if (unit.status !== "Unsold" || unit.allocatedTo) {
      return res.status(400).json({ message: "This unit is not available for allocation." });
    }

    // The target must be an active investor for this specific property.
    const membership = await Membership.findOne({ userId: investorId, propertyId: unit.propertyId, status: "investor" });
    if (!membership) {
      return res.status(400).json({ message: "Selected user is not an active investor for this property." });
    }

    // One unit per investor per property — free any unit currently allocated to this investor in the SAME property.
    await ApartmentUnit.updateMany(
      { allocatedTo: investorId, propertyId: unit.propertyId },
      {
        $set: { status: "Unsold" },
        $unset: { allocatedTo: "", allocatedBy: "", allocatedAt: "", handoverMonth: "", handoverYear: "" },
      }
    );

    unit.status = "Booked";
    unit.allocatedTo = investorId;
    unit.allocatedBy = req.user._id;
    unit.allocatedAt = new Date();
    unit.handoverMonth = month;
    unit.handoverYear = year;
    await unit.save();

    await unit.populate("allocatedTo", "name email phone");
    res.status(200).json({ message: "Unit allocated to investor.", unit });
  } catch (error) {
    console.error("allocateUnit error:", error);
    res.status(500).json({ message: "Server error allocating unit." });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Remove an allocation (frees the unit back to Available)
// @route   POST /api/management/deallocate
// @access  Private (Management, Admin)
//          body: { unitId }
// ─────────────────────────────────────────────────────────────────────────────
const deallocateUnit = async (req, res) => {
  try {
    const { unitId } = req.body;
    const unit = await ApartmentUnit.findById(unitId);
    if (!unit) return res.status(404).json({ message: "Unit not found." });
    if (!unit.allocatedTo) {
      return res.status(400).json({ message: "This unit is not allocated." });
    }

    unit.status = "Unsold";
    unit.allocatedTo = null;
    unit.allocatedBy = null;
    unit.allocatedAt = null;
    unit.handoverMonth = null;
    unit.handoverYear = null;
    await unit.save();

    res.status(200).json({ message: "Allocation removed.", unit });
  } catch (error) {
    console.error("deallocateUnit error:", error);
    res.status(500).json({ message: "Server error removing allocation." });
  }
};

module.exports = {
  getBuildings,
  getBuildingUnits,
  getInvestors,
  allocateUnit,
  deallocateUnit,
};
