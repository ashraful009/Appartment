const propertyRepository = require("../repositories/PropertyRepository");
const apartmentUnitRepository = require("../repositories/ApartmentUnitRepository");
const membershipRepository = require("../repositories/MembershipRepository");

// ─────────────────────────────────────────────────────────────────────────────
// @desc    All buildings with per-status unit counts (available/booked/sold)
// @route   GET /api/management/buildings
// @access  Private (Management, Admin)
// ─────────────────────────────────────────────────────────────────────────────
const getBuildings = async (req, res) => {
  try {
    const properties = await propertyRepository.db('properties')
      .orderBy('display_order', 'asc')
      .orderBy('name', 'asc')
      .select('id as _id', 'name', 'address', 'main_image as mainImage', 'total_units as totalUnits');

    const counts = await apartmentUnitRepository.db('apartment_units')
      .select('property_id', 'status')
      .count('id as c')
      .groupBy('property_id', 'status');

    const countMap = {};
    for (const row of counts) {
      const key = row.property_id?.toString();
      if (!key) continue;
      (countMap[key] ||= { available: 0, booked: 0, sold: 0, total: 0 });
      const c = parseInt(row.c, 10);
      if (row.status === "Unsold") countMap[key].available += c;
      else if (row.status === "Booked") countMap[key].booked += c;
      else if (row.status === "Sold") countMap[key].sold += c;
      countMap[key].total += c;
    }

    const result = properties.map((p) => ({
      ...p,
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
    const units = await apartmentUnitRepository.db('apartment_units')
      .where({ property_id: req.params.id })
      .leftJoin('users', 'apartment_units.allocated_to', 'users.id')
      .orderBy('floor', 'asc')
      .orderBy('column_line', 'asc')
      .select(
        'apartment_units.id as _id',
        'apartment_units.unit_name as unitName',
        'apartment_units.floor',
        'apartment_units.column_line as columnLine',
        'apartment_units.status',
        'apartment_units.handover_month as handoverMonth',
        'apartment_units.handover_year as handoverYear',
        'users.id as userId',
        'users.name as userName',
        'users.email as userEmail',
        'users.phone as userPhone'
      );

    const formattedUnits = units.map(u => {
        const unit = { ...u, allocatedTo: null };
        if (u.userId) {
            unit.allocatedTo = { _id: u.userId, name: u.userName, email: u.userEmail, phone: u.userPhone };
        }
        delete unit.userId;
        delete unit.userName;
        delete unit.userEmail;
        delete unit.userPhone;
        return unit;
    });

    res.status(200).json(formattedUnits);
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
    const memberships = await membershipRepository.db('memberships')
      .where({ 'memberships.status': 'investor' })
      .leftJoin('users', 'memberships.user_id', 'users.id')
      .leftJoin('properties', 'memberships.property_id', 'properties.id')
      .orderBy('memberships.updated_at', 'desc')
      .select(
          'memberships.id as _id',
          'memberships.shares',
          'memberships.total_approved_paid as totalApprovedPaid',
          'users.id as userId',
          'users.name as userName',
          'users.email as userEmail',
          'users.phone as userPhone',
          'users.profile_photo as userProfilePhoto',
          'properties.id as propertyId',
          'properties.name as propertyName'
      );

    const userIds = memberships.map(m => m.userId).filter(Boolean);
    
    let allocated = [];
    if (userIds.length > 0) {
        allocated = await apartmentUnitRepository.db('apartment_units')
            .whereIn('allocated_to', userIds)
            .leftJoin('properties', 'apartment_units.property_id', 'properties.id')
            .select(
                'apartment_units.id as _id',
                'apartment_units.allocated_to',
                'apartment_units.unit_name as unitName',
                'apartment_units.floor',
                'apartment_units.handover_month as handoverMonth',
                'apartment_units.handover_year as handoverYear',
                'properties.id as propertyId',
                'properties.name as propertyName'
            );
    }

    const allocMap = {};
    for (const u of allocated) {
      if (u.allocated_to && u.propertyId) {
        const key = `${u.allocated_to.toString()}_${u.propertyId.toString()}`;
        allocMap[key] = {
          unitId: u._id,
          unitName: u.unitName,
          floor: u.floor,
          building: u.propertyName || "—",
          buildingId: u.propertyId,
          handoverMonth: u.handoverMonth,
          handoverYear: u.handoverYear,
        };
      }
    }

    const result = memberships.map((m) => {
      const uId = m.userId?.toString() || "";
      const pId = m.propertyId?.toString() || "";
      const key = uId && pId ? `${uId}_${pId}` : "";
      return {
        _id: m._id,
        userId: { _id: m.userId, name: m.userName, email: m.userEmail, phone: m.userPhone, profilePhoto: m.userProfilePhoto },
        shares: m.shares,
        totalApprovedPaid: m.totalApprovedPaid,
        propertyId: { _id: m.propertyId, name: m.propertyName },
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
//          body: { unitId, membershipId, handoverMonth, handoverYear }
// ─────────────────────────────────────────────────────────────────────────────
const allocateUnit = async (req, res) => {
  try {
    const { unitId, investorId, membershipId, handoverMonth, handoverYear } = req.body;
    
    if (!membershipId) {
       return res.status(400).json({ message: "membershipId is required for allocation." });
    }

    const month = parseInt(handoverMonth, 10);
    const year = parseInt(handoverYear, 10);

    if (!Number.isInteger(month) || month < 1 || month > 12) {
      return res.status(400).json({ message: "Select a valid handover month." });
    }
    if (!Number.isInteger(year) || year < 2000 || year > 2100) {
      return res.status(400).json({ message: "Select a valid handover year." });
    }

    const unit = await apartmentUnitRepository.findById(unitId);
    if (!unit) return res.status(404).json({ message: "Unit not found." });
    if (unit.status !== "Unsold" || unit.allocated_to) {
      return res.status(400).json({ message: "This unit is not available for allocation." });
    }

    const membership = await membershipRepository.findById(membershipId);
    if (!membership || membership.status !== "investor") {
      return res.status(400).json({ message: "Selected membership is not an active investor." });
    }

    if (membership.unit_id) {
       await apartmentUnitRepository.update(membership.unit_id, {
        status: "Unsold",
        allocated_to: null,
        allocated_by: null,
        allocated_at: null,
        handover_month: null,
        handover_year: null
      });
    }

    const updatedUnit = await apartmentUnitRepository.update(unitId, {
        status: "Booked",
        allocated_to: investorId,
        allocated_by: req.user.id,
        allocated_at: apartmentUnitRepository.db.fn.now(),
        handover_month: month,
        handover_year: year
    });

    await membershipRepository.update(membershipId, { unit_id: unitId });

    res.status(200).json({ message: "Unit allocated to investor.", unit: updatedUnit });
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
    const unit = await apartmentUnitRepository.findById(unitId);
    if (!unit) return res.status(404).json({ message: "Unit not found." });
    if (!unit.allocated_to) {
      return res.status(400).json({ message: "This unit is not allocated." });
    }

    const updatedUnit = await apartmentUnitRepository.update(unitId, {
      status: "Unsold",
      allocated_to: null,
      allocated_by: null,
      allocated_at: null,
      handover_month: null,
      handover_year: null
    });

    await membershipRepository.db('memberships').where({ unit_id: unitId }).update({ unit_id: null });

    res.status(200).json({ message: "Unit deallocated successfully.", unit: updatedUnit });
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
