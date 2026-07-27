const membershipRepository = require("../../repositories/MembershipRepository");
const investmentLedgerRepository = require("../../repositories/InvestmentLedgerRepository");
const investmentSettingRepository = require("../../repositories/InvestmentSettingRepository");
const userRepository = require("../../repositories/UserRepository");
const propertyRepository = require("../../repositories/PropertyRepository");
const { BOOKING_MONEY } = require("../../config/investmentConstants");
const { isDuplicateKeyError } = require("../../utils/dbUtils");
const {
  finalizeEntry,
  applyDueDayToAllInstallments,
} = require("../../services/membershipService");

const IN_PROGRESS = ["Pending", "AccountantConfirmed", "DataEntryConfirmed"];
const STAGE_LABEL = {
  Pending: "Awaiting Accountant",
  AccountantConfirmed: "Awaiting Data Entry",
  DataEntryConfirmed: "Awaiting Management",
  Paid: "Completed",
  Unpaid: "Not submitted",
};




const listMemberships = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter['memberships.status'] = req.query.status;
    if (req.query.propertyId) filter['memberships.property_id'] = req.query.propertyId;

    const memberships = await membershipRepository.db('memberships')
      .where(filter)
      .leftJoin('users', 'memberships.user_id', 'users.id')
      .leftJoin('properties', 'memberships.property_id', 'properties.id')
      .orderBy('memberships.updated_at', 'desc')
      .select(
          'memberships.*',
          'users.name as userName', 'users.email as userEmail', 'users.phone as userPhone', 'users.profile_photo as userProfilePhoto',
          'properties.name as propertyName', 'properties.main_image as propertyMainImage', 'properties.address as propertyAddress', 'properties.status as propertyStatus'
      );

    const ids = memberships.map((m) => m.id);
    let counts = [];
    if (ids.length > 0) {
        counts = await investmentLedgerRepository.db('investment_ledgers')
        .whereIn('membership_id', ids)
        .whereIn('status', IN_PROGRESS)
        .groupBy('membership_id')
        .select('membership_id')
        .count('id as count');
    }
    const inProgressMap = Object.fromEntries(
      counts.map((c) => [c.membership_id.toString(), parseInt(c.count, 10)])
    );

    const result = memberships.map((m) => ({
      ...m,
      _id: m.id,
      userId: { _id: m.user_id, name: m.userName, email: m.userEmail, phone: m.userPhone, profilePhoto: m.userProfilePhoto },
      propertyId: { _id: m.property_id, name: m.propertyName, mainImage: m.propertyMainImage, address: m.propertyAddress, status: m.propertyStatus },
      inProgressCount: inProgressMap[m.id.toString()] || 0,
    }));

    res.status(200).json(result);
  } catch (error) {
    console.error("Error listing memberships:", error);
    res.status(500).json({ message: "Server error listing memberships." });
  }
};




const getMembershipDetail = async (req, res) => {
  try {
    const paramId = req.params.membershipId || req.params.userId;

    let membership = await membershipRepository.db('memberships')
        .where({ 'memberships.id': paramId })
        .orWhere({ 'memberships.user_id': paramId })
        .leftJoin('users', 'memberships.user_id', 'users.id')
        .leftJoin('properties', 'memberships.property_id', 'properties.id')
        .select(
            'memberships.*',
            'users.name as userName', 'users.email as userEmail', 'users.phone as userPhone', 'users.profile_photo as userProfilePhoto',
            'properties.name as propertyName', 'properties.main_image as propertyMainImage', 'properties.address as propertyAddress', 'properties.status as propertyStatus'
        ).first();

    if (!membership) {
      return res.status(404).json({ message: "Membership not found." });
    }
    
    
    const formattedMembership = {
      ...membership,
      _id: membership.id,
      userId: { _id: membership.user_id, name: membership.userName, email: membership.userEmail, phone: membership.userPhone, profilePhoto: membership.userProfilePhoto },
      propertyId: { _id: membership.property_id, name: membership.propertyName, mainImage: membership.propertyMainImage, address: membership.propertyAddress, status: membership.propertyStatus }
    };

    const ledger = await investmentLedgerRepository.db('investment_ledgers')
      .where({ membership_id: membership.id })
      .orderBy('type', 'asc')
      .orderBy('installment_number', 'asc')
      .orderBy('created_at', 'asc');

    const sum = (arr) => arr.reduce((s, e) => s + (Number(e.amount) || 0), 0);
    const totals = {
      booking:       sum(ledger.filter((e) => e.type === "booking" && e.status === "Paid")),
      downpayment:   sum(ledger.filter((e) => e.type === "downpayment" && e.status === "Paid")),
      installments:  sum(ledger.filter((e) => e.type === "installment" && e.status === "Paid")),
      totalPaid:     sum(ledger.filter((e) => e.status === "Paid")),
      totalPending:  sum(ledger.filter((e) => IN_PROGRESS.includes(e.status))),
      totalDue:      sum(ledger.filter((e) => e.status === "Unpaid")),
    };

    res.status(200).json({
      membership: formattedMembership,
      ledger,
      totals,
    });
  } catch (error) {
    console.error("Error fetching membership detail:", error);
    res.status(500).json({ message: "Server error fetching membership detail." });
  }
};




const createBookingForUser = async (req, res) => {
  try {
    const { userId, propertyId, autoApprove } = req.body;
    if (!userId) return res.status(400).json({ message: "userId is required." });
    if (!propertyId) return res.status(400).json({ message: "propertyId is required." });

    const user = await userRepository.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    const property = await propertyRepository.findById(propertyId);
    if (!property) return res.status(404).json({ message: "Property not found." });

    

    const membership = await membershipRepository.create({
      user_id: userId,
      property_id: propertyId,
      status: "pending_booking",
      booking_money: BOOKING_MONEY,
    });

    const entry = await investmentLedgerRepository.create({
      membership_id: membership.id,
      user_id: userId,
      property_id: propertyId,
      type: "booking",
      amount: BOOKING_MONEY,
      due_date: new Date(),
      status: "Pending",
      description: "Created by admin",
      submitted_at: new Date(),
    });

    if (autoApprove) {
      await finalizeEntry(entry, req.user.id);
    }

    const fresh = await membershipRepository.db('memberships')
        .where({ 'memberships.id': membership.id })
        .leftJoin('properties', 'memberships.property_id', 'properties.id')
        .select('memberships.*', 'properties.name as propertyName', 'properties.main_image as propertyMainImage', 'properties.address as propertyAddress', 'properties.status as propertyStatus')
        .first();
        
    const formattedFresh = {
      ...fresh,
      _id: fresh.id,
      propertyId: { _id: fresh.property_id, name: fresh.propertyName, mainImage: fresh.propertyMainImage, address: fresh.propertyAddress, status: fresh.propertyStatus }
    };
        
    res.status(201).json({ message: "Membership created.", membership: formattedFresh });
  } catch (error) {
    console.error("Error creating membership:", error);
    if (isDuplicateKeyError(error)) {
      return res.status(400).json({
        message: "This user already has a membership for this property.",
      });
    }
    res.status(500).json({ message: "Server error creating membership." });
  }
};




const getPaymentTracking = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter['investment_ledgers.status'] = req.query.status;

    const query = investmentLedgerRepository.db('investment_ledgers')
      .whereNot({ 'investment_ledgers.status': "Unpaid" });
      
    if (req.query.status) {
        query.where(filter);
    }
      
    const entries = await query
      .leftJoin('users', 'investment_ledgers.user_id', 'users.id')
      .leftJoin('properties', 'investment_ledgers.property_id', 'properties.id')
      .orderBy('investment_ledgers.updated_at', 'desc')
      .select(
        'investment_ledgers.*',
        'users.name as userName', 'users.email as userEmail', 'users.phone as userPhone', 'users.profile_photo as userProfilePhoto',
        'properties.name as propertyName', 'properties.main_image as propertyMainImage'
      );

    const result = entries.map((e) => ({
      ...e,
      _id: e.id,
      userId: { _id: e.user_id, name: e.userName, email: e.userEmail, phone: e.userPhone, profilePhoto: e.userProfilePhoto },
      propertyId: { _id: e.property_id, name: e.propertyName, mainImage: e.propertyMainImage },
      stageLabel: STAGE_LABEL[e.status] || e.status,
    }));

    res.status(200).json(result);
  } catch (error) {
    console.error("getPaymentTracking error:", error);
    res.status(500).json({ message: "Server error fetching payment tracking." });
  }
};




const getInstallmentDueDay = async (req, res) => {
  try {
    const settings = await investmentSettingRepository.findByKey('installment_due_day');
    const day = settings?.value?.installmentDueDay || 10;
    res.status(200).json({ installmentDueDay: day });
  } catch (error) {
    console.error("getInstallmentDueDay error:", error);
    res.status(500).json({ message: "Server error fetching due day." });
  }
};




const setInstallmentDueDay = async (req, res) => {
  try {
    const day = Number(req.body.installmentDueDay);
    if (!Number.isInteger(day) || day < 1 || day > 31) {
      return res.status(400).json({ message: "Due day must be a whole number between 1 and 31." });
    }

    const existing = await investmentSettingRepository.findByKey('installment_due_day');
    if (existing) {
        await investmentSettingRepository.update(existing.id, { value: { installmentDueDay: day }});
    } else {
        await investmentSettingRepository.create({ key: 'installment_due_day', value: { installmentDueDay: day }});
    }

    const updated = await applyDueDayToAllInstallments(day);

    res.status(200).json({
      message: `Installment due day set to ${day}. ${updated} installment(s) updated.`,
      installmentDueDay: day,
      updated,
    });
  } catch (error) {
    console.error("setInstallmentDueDay error:", error);
    res.status(500).json({ message: "Server error setting due day." });
  }
};




const getPropertiesForMembership = async (req, res) => {
  try {
    const properties = await propertyRepository.db('properties')
      .whereIn('status', ["Ongoing", "Upcoming"])
      .select('id as _id', 'name', 'address', 'main_image as mainImage', 'status')
      .orderBy('display_order', 'asc')
      .orderBy('name', 'asc');

    res.status(200).json({ properties });
  } catch (error) {
    console.error("getPropertiesForMembership error:", error);
    res.status(500).json({ message: "Server error fetching properties." });
  }
};

module.exports = {
  listMemberships,
  getMembershipDetail,
  createBookingForUser,
  getPaymentTracking,
  getInstallmentDueDay,
  setInstallmentDueDay,
  getPropertiesForMembership,
};
