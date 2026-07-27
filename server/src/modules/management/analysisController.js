const membershipRepository = require("../../repositories/MembershipRepository");
const investmentLedgerRepository = require("../../repositories/InvestmentLedgerRepository");
const apartmentUnitRepository = require("../../repositories/ApartmentUnitRepository");
const propertyRepository = require("../../repositories/PropertyRepository");
const userRepository = require("../../repositories/UserRepository");

const getAnalysisMemberships = async (req, res) => {
  try {
    const { processFilter } = req.query;

    const membershipsRaw = await membershipRepository.db('memberships')
      .whereIn('memberships.status', ['member', 'investor'])
      .leftJoin('users', 'memberships.user_id', 'users.id')
      .leftJoin('properties', 'memberships.property_id', 'properties.id')
      .select(
        'memberships.*',
        'users.id as userId', 'users.name as userName', 'users.email as userEmail', 'users.phone as userPhone', 'users.profile_photo as userProfilePhoto',
        'properties.id as propertyId', 'properties.name as propertyName', 'properties.main_image as propertyMainImage', 'properties.address as propertyAddress'
      );

    const mIds = membershipsRaw.map(m => m.id);

    const ledgerRaw = mIds.length > 0 ? await investmentLedgerRepository.db('investment_ledgers')
      .whereIn('membership_id', mIds)
      .orderBy('due_date', 'asc')
      .orderBy('created_at', 'asc')
      .select('*') : [];

    

    const userIds = membershipsRaw.map((m) => m.userId).filter(Boolean);
    const unitsRaw = userIds.length > 0 ? await apartmentUnitRepository.db('apartment_units')
      .whereIn('allocated_to', userIds)
      .leftJoin('properties', 'apartment_units.property_id', 'properties.id')
      .select('apartment_units.*', 'properties.id as propertyId', 'properties.name as propertyName') : [];

    const unitMap = {};
    for (const u of unitsRaw) {
      if (u.allocated_to && u.propertyId) {
        const key = `${u.allocated_to}_${u.propertyId}`;
        unitMap[key] = {
          unitId: u.id,
          unitName: u.unit_name,
          floor: u.floor,
          columnLine: u.column_line,
          building: u.propertyName || "—",
          buildingId: u.propertyId,
          handoverMonth: u.handover_month,
          handoverYear: u.handover_year,
          status: u.status,
        };
      }
    }

    const ledgerByMembership = {};
    for (const e of ledgerRaw) {
      const key = e.membership_id;
      
      const entry = {
          ...e,
          _id: e.id,
          membershipId: e.membership_id,
          dueDate: e.due_date,
          amountDue: e.amount_due,
          submittedAt: e.submitted_at,
          paymentMethod: e.payment_method,
          paymentDetails: e.payment_details,
          invoiceUrl: e.invoice_url,
          batchId: e.batch_id
      };
      (ledgerByMembership[key] ||= []).push(entry);
    }

    const startOfPrevMonth = new Date();
    startOfPrevMonth.setMonth(startOfPrevMonth.getMonth() - 1);
    startOfPrevMonth.setDate(1);
    startOfPrevMonth.setHours(0, 0, 0, 0);

    const endOfCurrentMonth = new Date();
    endOfCurrentMonth.setMonth(endOfCurrentMonth.getMonth() + 1);
    endOfCurrentMonth.setDate(0);
    endOfCurrentMonth.setHours(23, 59, 59, 999);

    let result = membershipsRaw.map((m) => {
      const entries = ledgerByMembership[m.id] || [];
      const uId = m.userId || "";
      const pId = m.propertyId || "";
      const key = uId && pId ? `${uId}_${pId}` : "";

      const processRangeEntries = entries.filter((e) => {
        if (e.status === "Paid") return false;
        if (!e.dueDate) return false;
        const d = new Date(e.dueDate);
        return d >= startOfPrevMonth && d <= endOfCurrentMonth;
      });

      return {
        _id: m.id,
        userId: { _id: m.userId, name: m.userName, email: m.userEmail, phone: m.userPhone, profilePhoto: m.userProfilePhoto },
        propertyId: { _id: m.propertyId, name: m.propertyName, mainImage: m.propertyMainImage, address: m.propertyAddress },
        status: m.status,
        shares: m.shares,
        totalApprovedPaid: parseFloat(m.total_approved_paid) || 0,
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

const extendDueDate = async (req, res) => {
  try {
    const { newDueDate } = req.body;
    if (!newDueDate) {
      return res.status(400).json({ message: "newDueDate is required." });
    }

    const entry = await investmentLedgerRepository.findById(req.params.id);
    if (!entry) {
      return res.status(404).json({ message: "Payment entry not found." });
    }

    const updatedEntry = await investmentLedgerRepository.update(entry.id, { due_date: new Date(newDueDate) });

    res.status(200).json({ message: "Due date extended successfully.", entry: { ...updatedEntry, _id: updatedEntry.id, dueDate: updatedEntry.due_date } });
  } catch (error) {
    console.error("extendDueDate error:", error);
    res.status(500).json({ message: "Server error extending due date." });
  }
};

const resetLedgerEntry = async (req, res) => {
  try {
    const entry = await investmentLedgerRepository.findById(req.params.id);
    if (!entry) {
      return res.status(404).json({ message: "Payment entry not found." });
    }

    const updates = {
      status: "Unpaid",
      payment_method: null,
      payment_details: {},
      invoice_url: "",
      description: "",
      batch_id: null,
      submitted_at: null,
      audit: { accountant: {}, dataEntry: {}, management: {} }
    };
    
    const updatedEntry = await investmentLedgerRepository.update(entry.id, updates);

    if (entry.type === "downpayment") {
      const membership = await membershipRepository.findById(entry.membership_id);
      if (membership) {
        await membershipRepository.update(membership.id, {
            status: "member",
            installments_generated: false,
            down_payment_completed_at: null
        });

        await investmentLedgerRepository.db('investment_ledgers').where({
          membership_id: membership.id,
          type: "installment"
        }).del();

        const user = await userRepository.findById(membership.user_id, ['roles']);
        if (user) {
          const { removeRole, addRole } = require("../../services/membershipService");
          
          const otherInvestorCountRec = await membershipRepository.db('memberships').where({
            user_id: membership.user_id,
            status: "investor"
          }).whereNot('id', membership.id).count('id as count').first();
          
          const otherInvestorCount = parseInt(otherInvestorCountRec.count, 10);
          
          if (otherInvestorCount === 0) {
            
            let roles = user.roles || [];
            roles = roles.filter(r => r !== "Investor");
            if (!roles.includes("member")) roles.push("member");
            await userRepository.update(user.id, { roles });
          }
        }
      }
    }

    res.status(200).json({ message: "Payment entry reset back to Unpaid.", entry: { ...updatedEntry, _id: updatedEntry.id } });
  } catch (error) {
    console.error("resetLedgerEntry error:", error);
    res.status(500).json({ message: "Server error resetting payment entry." });
  }
};

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

    const unit = await apartmentUnitRepository.findById(req.params.unitId);
    if (!unit) {
      return res.status(404).json({ message: "Unit not found." });
    }

    const updatedUnit = await apartmentUnitRepository.update(unit.id, {
        handover_month: month,
        handover_year: year
    });

    res.status(200).json({ message: "Handover time updated successfully.", unit: { ...updatedUnit, _id: updatedUnit.id, handoverMonth: updatedUnit.handover_month, handoverYear: updatedUnit.handover_year } });
  } catch (error) {
    console.error("updateHandoverTime error:", error);
    res.status(500).json({ message: "Server error updating handover time." });
  }
};

const getPropertiesForAnalysis = async (req, res) => {
  try {
    const properties = await propertyRepository.db('properties')
      .whereIn('status', ["Ongoing", "Upcoming"])
      .select('id as _id', 'name', 'address', 'main_image as mainImage', 'status')
      .orderBy('display_order', 'asc')
      .orderBy('name', 'asc');

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
