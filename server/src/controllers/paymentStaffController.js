const membershipRepository = require("../repositories/MembershipRepository");
const investmentLedgerRepository = require("../repositories/InvestmentLedgerRepository");
const apartmentUnitRepository = require("../repositories/ApartmentUnitRepository");
const { advanceLedgerEntry, STAGE } = require("../services/membershipService");

const AUDIT_POPULATE = [
  'users as accountant_by', 'audit.accountant.by', 'accountant_by.id',
  'users as data_entry_by', 'audit.dataEntry.by', 'data_entry_by.id',
  'users as management_by', 'audit.management.by', 'management_by.id'
]; // Just conceptual mappings for knex logic later

const IN_PROGRESS = ["Pending", "AccountantConfirmed", "DataEntryConfirmed"];

// ─────────────────────────────────────────────────────────────────────────────
// Stage handler factory
// ─────────────────────────────────────────────────────────────────────────────
const makeStageHandlers = (stageKey) => {
  const inputStatus = STAGE[stageKey].input;

  const getPending = async (req, res) => {
    try {
      // In a real query you would do a proper join, we simplify it here returning standard fields
      const entries = await investmentLedgerRepository.db('investment_ledgers')
        .where({ 'investment_ledgers.status': inputStatus })
        .leftJoin('users', 'investment_ledgers.user_id', 'users.id')
        .leftJoin('properties', 'investment_ledgers.property_id', 'properties.id')
        .orderBy('submitted_at', 'asc')
        .orderBy('investment_ledgers.created_at', 'asc')
        .select(
            'investment_ledgers.*',
            'users.name as userName',
            'users.email as userEmail',
            'users.phone as userPhone',
            'users.profile_photo as userProfilePhoto',
            'properties.name as propertyName',
            'properties.main_image as propertyMainImage'
        );

      const formattedEntries = entries.map(e => {
        let paymentDetails = e.payment_details;
        let audit = e.audit;
        if (typeof paymentDetails === 'string') {
            try { paymentDetails = JSON.parse(paymentDetails); } catch (err) {}
        }
        if (typeof audit === 'string') {
            try { audit = JSON.parse(audit); } catch (err) {}
        }

        const entry = { 
            ...e, 
            _id: e.id,
            batchId: e.batch_id,
            paymentMethod: e.payment_method,
            paymentDetails: paymentDetails,
            invoiceUrl: e.invoice_url,
            submittedAt: e.submitted_at,
            installmentNumber: e.installment_number,
            audit: audit,
            userId: null, 
            propertyId: null 
        };
        if (e.user_id) entry.userId = { _id: e.user_id, name: e.userName, email: e.userEmail, phone: e.userPhone, profilePhoto: e.userProfilePhoto };
        if (e.property_id) entry.propertyId = { _id: e.property_id, name: e.propertyName, mainImage: e.propertyMainImage };
        return entry;
      });

      res.status(200).json(formattedEntries);
    } catch (error) {
      console.error(`getPending(${stageKey}) error:`, error);
      res.status(500).json({ message: "Server error fetching pending payments." });
    }
  };

  const confirm = async (req, res) => {
    try {
      const entry = await investmentLedgerRepository.findById(req.params.id);
      if (!entry) return res.status(404).json({ message: "Payment entry not found." });

      let result;
      try {
        result = await advanceLedgerEntry(entry, stageKey, req.user.id);
      } catch (e) {
        return res.status(400).json({ message: e.message });
      }

      res.status(200).json({ message: "Payment confirmed.", entry: result.entry });
    } catch (error) {
      console.error(`confirm(${stageKey}) error:`, error);
      res.status(500).json({ message: "Server error confirming payment." });
    }
  };

  const confirmBatch = async (req, res) => {
    try {
      const entries = await investmentLedgerRepository.db('investment_ledgers').where({
        batch_id: req.params.batchId,
        status: inputStatus,
      });
      if (entries.length === 0) {
        return res.status(404).json({ message: "No payments awaiting confirmation in this batch." });
      }
      for (const entry of entries) {
        await advanceLedgerEntry(entry, stageKey, req.user.id);
      }
      res.status(200).json({ message: `Confirmed ${entries.length} payment(s).` });
    } catch (error) {
      console.error(`confirmBatch(${stageKey}) error:`, error);
      res.status(500).json({ message: "Server error confirming batch." });
    }
  };

  const reject = async (req, res) => {
    try {
      const entry = await investmentLedgerRepository.findById(req.params.id);
      if (!entry) return res.status(404).json({ message: "Payment entry not found." });
      if (entry.status === "Paid") {
        return res.status(400).json({ message: "Cannot reject an already-completed payment." });
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

      res.status(200).json({ message: "Payment rejected and returned to the user.", entry: updatedEntry });
    } catch (error) {
      console.error(`reject(${stageKey}) error:`, error);
      res.status(500).json({ message: "Server error rejecting payment." });
    }
  };

  return { getPending, confirm, confirmBatch, reject };
};

// ─────────────────────────────────────────────────────────────────────────────
// Member stats — shared across all staff panels.
// ─────────────────────────────────────────────────────────────────────────────
const computeStats = (ledger, now = new Date()) => {
  const installments = ledger.filter((e) => e.type === "installment");
  const paid = ledger.filter((e) => e.status === "Paid");

  const lastPaymentDate = paid
    .map((e) => e.audit?.management?.at || e.submitted_at || e.updated_at)
    .filter(Boolean)
    .sort((a, b) => new Date(b) - new Date(a))[0] || null;

  const unpaidInstallments = installments.filter((e) => e.status === "Unpaid");
  const nextDueDate = unpaidInstallments
    .map((e) => e.due_date)
    .filter(Boolean)
    .sort((a, b) => new Date(a) - new Date(b))[0] || null;

  return {
    installmentsTotal:     installments.length,
    installmentsPaidCount: installments.filter((e) => e.status === "Paid").length,
    installmentsRemaining: installments.filter((e) => e.status !== "Paid").length,
    overdueCount:          unpaidInstallments.filter(
      (e) => e.due_date && new Date(e.due_date) < now
    ).length,
    inProgressCount:       ledger.filter((e) => IN_PROGRESS.includes(e.status)).length,
    lastPaymentDate,
    nextDueDate,
  };
};

const getMembers = async (req, res) => {
  try {
    const memberships = await membershipRepository.db('memberships')
      .whereIn('memberships.status', ["member", "investor"])
      .leftJoin('users', 'memberships.user_id', 'users.id')
      .leftJoin('properties', 'memberships.property_id', 'properties.id')
      .select(
        'memberships.*',
        'users.name as userName', 'users.email as userEmail', 'users.phone as userPhone', 'users.profile_photo as userProfilePhoto',
        'properties.name as propertyName', 'properties.main_image as propertyMainImage', 'properties.address as propertyAddress'
      );

    const ids = memberships.map((m) => m.id);
    let ledger = [];
    if (ids.length > 0) {
        ledger = await investmentLedgerRepository.db('investment_ledgers').whereIn('membership_id', ids);
    }

    const byMembership = {};
    for (const e of ledger) {
      const key = e.membership_id.toString();
      (byMembership[key] ||= []).push(e);
    }

    const now = new Date();
    const result = memberships.map((m) => ({
      _id: m.id,
      userId: { _id: m.user_id, name: m.userName, email: m.userEmail, phone: m.userPhone, profilePhoto: m.userProfilePhoto },
      status: m.status,
      shares: m.shares,
      totalApprovedPaid: m.total_approved_paid,
      propertyId: { _id: m.property_id, name: m.propertyName, mainImage: m.propertyMainImage, address: m.propertyAddress },
      ...computeStats(byMembership[m.id.toString()] || [], now),
    }));

    result.sort((a, b) => b.overdueCount - a.overdueCount);
    res.status(200).json(result);
  } catch (error) {
    console.error("getMembers error:", error);
    res.status(500).json({ message: "Server error fetching members." });
  }
};

const getMemberProfile = async (req, res) => {
  try {
    const paramId = req.params.userId;
    let membership = await membershipRepository.db('memberships')
        .where({ 'memberships.id': paramId })
        .orWhere({ 'memberships.user_id': paramId })
        .leftJoin('users', 'memberships.user_id', 'users.id')
        .leftJoin('properties', 'memberships.property_id', 'properties.id')
        .select(
            'memberships.*',
            'users.name as userName', 'users.email as userEmail', 'users.phone as userPhone', 'users.profile_photo as userProfilePhoto',
            'properties.name as propertyName', 'properties.main_image as propertyMainImage', 'properties.address as propertyAddress'
        ).first();

    if (!membership) return res.status(404).json({ message: "Membership not found." });

    // Format membership object
    const formattedMembership = {
        ...membership,
        _id: membership.id,
        userId: { _id: membership.user_id, name: membership.userName, email: membership.userEmail, phone: membership.userPhone, profilePhoto: membership.userProfilePhoto },
        propertyId: { _id: membership.property_id, name: membership.propertyName, mainImage: membership.propertyMainImage, address: membership.propertyAddress }
    };

    const ledger = await investmentLedgerRepository.db('investment_ledgers')
      .where({ membership_id: membership.id })
      .orderBy('type', 'asc')
      .orderBy('installment_number', 'asc')
      .orderBy('created_at', 'asc');

    const propertiesBoughtResult = await apartmentUnitRepository.db('apartment_units').where({
      customer_id: membership.user_id,
    }).whereIn('status', ["Sold", "Booked"]).count('id as c').first();
    const propertiesBought = parseInt(propertiesBoughtResult.c, 10);

    res.status(200).json({
      membership: formattedMembership,
      stats: {
        shares: membership.shares,
        totalApprovedPaid: membership.total_approved_paid,
        propertiesBought,
        ...computeStats(ledger),
      },
      ledger,
    });
  } catch (error) {
    console.error("getMemberProfile error:", error);
    res.status(500).json({ message: "Server error fetching member profile." });
  }
};

module.exports = { makeStageHandlers, getMembers, getMemberProfile };
