const crypto = require("crypto");
const { isDuplicateKeyError } = require("../../utils/dbUtils");
const membershipRepository = require("../../repositories/MembershipRepository");
const investmentLedgerRepository = require("../../repositories/InvestmentLedgerRepository");
const apartmentUnitRepository = require("../../repositories/ApartmentUnitRepository");
const {
  BOOKING_MONEY,
  DOWNPAYMENT_TARGET,
} = require("../../config/investmentConstants");

const buildPaymentInfo = (body = {}) => {
  const method = body.paymentMethod;
  if (!["MFS", "Bank", "Cash"].includes(method)) {
    return { error: "A valid payment method (MFS, Bank, or Cash) is required." };
  }

  const details = {
    provider:      body.provider      || "",
    mobileNumber:  body.mobileNumber  || "",
    bankName:      body.bankName      || "",
    accountNumber: body.accountNumber || "",
    holderName:    body.holderName    || "",
    transactionId: body.transactionId || "",
  };

  if (method === "MFS") {
    if (!["Bikash", "Nagad", "Rocket", "Upay"].includes(details.provider))
      return { error: "Select an MFS provider (Bikash, Nagad, Rocket, or Upay)." };
    if (!details.mobileNumber) return { error: "MFS mobile number is required." };
    if (!details.transactionId) return { error: "MFS transaction ID is required." };
  } else if (method === "Bank") {
    if (!details.bankName) return { error: "Select a bank." };
    if (!details.accountNumber) return { error: "Bank account number is required." };
    if (!details.transactionId) return { error: "Bank transaction ID is required." };
  }

  return { method, details };
};

const IN_PROGRESS = ["Pending", "AccountantConfirmed", "DataEntryConfirmed"];

const buildSummary = (ledger) => {
  const installments = ledger.filter((e) => e.type === "installment");
  const sum = (arr) => arr.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const inProgress = (e) => IN_PROGRESS.includes(e.status);

  return {
    totalPaid:        sum(ledger.filter((e) => e.status === "Paid")),
    totalPending:     sum(ledger.filter(inProgress)),
    installmentsProvided: sum(installments.filter((e) => e.status === "Paid")),
    installmentsDue:      sum(installments.filter((e) => e.status === "Unpaid")),
    installmentsPending:  sum(installments.filter(inProgress)),
    installmentsTotal:    installments.length,
    installmentsPaidCount: installments.filter((e) => e.status === "Paid").length,
  };
};

const getMyMembership = async (req, res) => {
  try {
    const memberships = await membershipRepository.db('memberships')
      .where({ user_id: req.user.id })
      .leftJoin('properties', 'memberships.property_id', 'properties.id')
      .orderBy('memberships.created_at', 'desc')
      .select(
          'memberships.*',
          'properties.name as propertyName', 'properties.main_image as propertyMainImage', 'properties.address as propertyAddress', 'properties.status as propertyStatus', 'properties.progress_video_url as propertyProgressVideoUrl', 'properties.progress_images as propertyProgressImages'
      );

    if (memberships.length === 0) {
      return res.status(200).json({ memberships: [], items: [] });
    }

    const formattedMemberships = memberships.map(m => {
        let progressImages = [];
        try { progressImages = typeof m.propertyProgressImages === 'string' ? JSON.parse(m.propertyProgressImages) : m.propertyProgressImages || []; } catch(e) {}
        
        return {
            ...m,
            _id: m.id,
            totalApprovedPaid: m.total_approved_paid,
            totalTarget: m.total_target,
            memberDeadline: m.member_deadline,
            shares: m.shares,
            propertyId: { _id: m.property_id, name: m.propertyName, mainImage: m.propertyMainImage, address: m.propertyAddress, status: m.propertyStatus, progressVideoUrl: m.propertyProgressVideoUrl, progressImages }
        };
    });

    const membershipIds = memberships.map((m) => m.id);
    const allLedger = await investmentLedgerRepository.db('investment_ledgers')
        .whereIn('membership_id', membershipIds)
        .orderBy('type', 'asc')
        .orderBy('installment_number', 'asc')
        .orderBy('created_at', 'asc');

    const unitIds = memberships.map(m => m.unit_id).filter(Boolean);
    let allocatedUnits = [];
    if (unitIds.length > 0) {
      allocatedUnits = await apartmentUnitRepository.db('apartment_units')
          .whereIn('apartment_units.id', unitIds)
          .leftJoin('properties', 'apartment_units.property_id', 'properties.id')
          .select(
              'apartment_units.id as id', 'apartment_units.unit_name as unitName', 'apartment_units.floor', 'apartment_units.status', 'apartment_units.handover_month as handoverMonth', 'apartment_units.handover_year as handoverYear', 'apartment_units.property_id as propertyId',
              'properties.name as propertyName', 'properties.address as propertyAddress', 'properties.main_image as propertyMainImage', 'properties.handover_time as propertyHandoverTime'
          );
    }

    const ledgerByMembership = {};
    for (const entry of allLedger) {
      const key = entry.membership_id.toString();
      (ledgerByMembership[key] ||= []).push(entry);
    }

    const unitsById = {};
    for (const unit of allocatedUnits) {
      unitsById[unit.id] = {
          unitName: unit.unitName,
          floor: unit.floor,
          status: unit.status,
          handoverMonth: unit.handoverMonth,
          handoverYear: unit.handoverYear,
          propertyId: { _id: unit.propertyId, name: unit.propertyName, address: unit.propertyAddress, mainImage: unit.propertyMainImage, handoverTime: unit.propertyHandoverTime }
      };
    }

    const items = formattedMemberships.map((m) => {
      const mId = m.id.toString();
      const pId = m.property_id?.toString();
      const ledger = ledgerByMembership[mId] || [];
      return {
        membership: m,
        ledger,
        summary: buildSummary(ledger),
        allocatedUnit: m.unit_id ? (unitsById[m.unit_id] || null) : null,
      };
    });

    res.status(200).json({ memberships: formattedMemberships, items });
  } catch (error) {
    console.error("Error fetching memberships:", error);
    res.status(500).json({ message: "Server error fetching memberships." });
  }
};

const getMyMembershipDetail = async (req, res) => {
  try {
    const membership = await membershipRepository.db('memberships')
        .where({ 'memberships.id': req.params.membershipId, 'memberships.user_id': req.user.id })
        .leftJoin('properties', 'memberships.property_id', 'properties.id')
        .select(
            'memberships.*',
            'properties.name as propertyName', 'properties.main_image as propertyMainImage', 'properties.address as propertyAddress', 'properties.status as propertyStatus', 'properties.progress_video_url as propertyProgressVideoUrl', 'properties.progress_images as propertyProgressImages'
        ).first();

    if (!membership) {
      return res.status(404).json({ message: "Membership not found." });
    }

    let progressImages = [];
    try { progressImages = typeof membership.propertyProgressImages === 'string' ? JSON.parse(membership.propertyProgressImages) : membership.propertyProgressImages || []; } catch(e) {}

    const formattedMembership = {
        ...membership,
        _id: membership.id,
        totalApprovedPaid: membership.total_approved_paid,
        totalTarget: membership.total_target,
        memberDeadline: membership.member_deadline,
        shares: membership.shares,
        propertyId: { _id: membership.property_id, name: membership.propertyName, mainImage: membership.propertyMainImage, address: membership.propertyAddress, status: membership.propertyStatus, progressVideoUrl: membership.propertyProgressVideoUrl, progressImages }
    };

    const ledger = await investmentLedgerRepository.db('investment_ledgers')
      .where({ membership_id: membership.id })
      .orderBy('type', 'asc')
      .orderBy('installment_number', 'asc')
      .orderBy('created_at', 'asc');

    let allocatedUnitRecord = null;
    if (membership.unit_id) {
        allocatedUnitRecord = await apartmentUnitRepository.db('apartment_units')
            .where({ 'apartment_units.id': membership.unit_id })
            .leftJoin('properties', 'apartment_units.property_id', 'properties.id')
            .select(
                'apartment_units.unit_name as unitName', 'apartment_units.floor', 'apartment_units.status', 'apartment_units.handover_month as handoverMonth', 'apartment_units.handover_year as handoverYear', 'apartment_units.property_id as propertyId',
                'properties.name as propertyName', 'properties.address as propertyAddress', 'properties.main_image as propertyMainImage', 'properties.handover_time as propertyHandoverTime'
            ).first();
    }

    let allocatedUnit = null;
    if (allocatedUnitRecord) {
        allocatedUnit = {
            unitName: allocatedUnitRecord.unitName,
            floor: allocatedUnitRecord.floor,
            status: allocatedUnitRecord.status,
            handoverMonth: allocatedUnitRecord.handoverMonth,
            handoverYear: allocatedUnitRecord.handoverYear,
            propertyId: { _id: allocatedUnitRecord.propertyId, name: allocatedUnitRecord.propertyName, address: allocatedUnitRecord.propertyAddress, mainImage: allocatedUnitRecord.propertyMainImage, handoverTime: allocatedUnitRecord.propertyHandoverTime }
        };
    }

    res.status(200).json({
      membership: formattedMembership,
      ledger,
      summary: buildSummary(ledger),
      allocatedUnit,
    });
  } catch (error) {
    console.error("Error fetching membership detail:", error);
    res.status(500).json({ message: "Server error fetching membership detail." });
  }
};

const submitBooking = async (req, res) => {
  try {
    const { propertyId, unitId } = req.body;
    if (!propertyId) {
      return res.status(400).json({ message: "propertyId is required." });
    }

    

    const invoiceUrl = req.file?.path || "";
    if (!invoiceUrl) {
      return res.status(400).json({ message: "An invoice file is required." });
    }

    const payment = buildPaymentInfo(req.body);
    if (payment.error) return res.status(400).json({ message: payment.error });

    const membership = await membershipRepository.create({
      user_id: req.user.id,
      property_id: propertyId,
      unit_id: unitId || null,
      status: "pending_booking",
      booking_money: BOOKING_MONEY,
    });

    await investmentLedgerRepository.create({
      membership_id: membership.id,
      user_id: req.user.id,
      property_id: propertyId,
      type: "booking",
      amount: BOOKING_MONEY,
      due_date: new Date(),
      status: "Pending",
      payment_method: payment.method,
      payment_details: payment.details, 
      invoice_url: invoiceUrl,
      description: req.body.description || "",
      submitted_at: new Date(),
    });

    res.status(201).json({
      message: "Booking submitted. Awaiting admin approval.",
      membership: { ...membership, _id: membership.id },
    });
  } catch (error) {
    console.error("Error submitting booking:", error);
    if (isDuplicateKeyError(error)) {
      return res.status(400).json({
        message: "You already have an investment journey for this property.",
      });
    }
    res.status(500).json({ message: "Server error submitting booking." });
  }
};

const submitDownPayment = async (req, res) => {
  try {
    const { membershipId } = req.body;
    if (!membershipId) {
      return res.status(400).json({ message: "membershipId is required." });
    }

    const membership = await membershipRepository.findOne({
      id: membershipId,
      user_id: req.user.id,
    });
    if (!membership) {
      return res.status(404).json({ message: "Membership not found." });
    }
    if (membership.status !== "member") {
      return res.status(400).json({
        message: "Down payment can only be submitted by an active member.",
      });
    }
    if (membership.member_deadline && new Date() > new Date(membership.member_deadline)) {
      return res.status(400).json({
        message: "Your 6-month membership window has expired.",
      });
    }

    const amount = Number(req.body.amount);
    if (!amount || amount < DOWNPAYMENT_TARGET) {
      return res.status(400).json({
        message: `Down payment must be at least ৳${DOWNPAYMENT_TARGET.toLocaleString()}.`,
      });
    }

    const invoiceUrl = req.file?.path || "";
    if (!invoiceUrl) {
      return res.status(400).json({ message: "An invoice file is required." });
    }

    const payment = buildPaymentInfo(req.body);
    if (payment.error) return res.status(400).json({ message: payment.error });

    const newCash = amount;

    await membershipRepository.update(membership.id, { down_payment_amount: amount });

    let entry = await investmentLedgerRepository.db('investment_ledgers').where({
      membership_id: membership.id,
      type: "downpayment",
    }).whereNot({ status: "Paid" }).first();

    if (entry) {
      entry = await investmentLedgerRepository.update(entry.id, {
          amount: newCash,
          payment_method: payment.method,
          payment_details: payment.details,
          invoice_url: invoiceUrl,
          description: req.body.description || "",
          status: "Pending",
          submitted_at: new Date()
      });
    } else {
      entry = await investmentLedgerRepository.create({
        membership_id: membership.id,
        user_id: req.user.id,
        property_id: membership.property_id || null,
        type: "downpayment",
        amount: newCash,
        due_date: new Date(),
        status: "Pending",
        payment_method: payment.method,
        payment_details: payment.details,
        invoice_url: invoiceUrl,
        description: req.body.description || "",
        submitted_at: new Date(),
      });
    }

    res.status(200).json({
      message: "Down payment submitted. Awaiting admin approval.",
      entry,
    });
  } catch (error) {
    console.error("Error submitting down payment:", error);
    res.status(500).json({ message: "Server error submitting down payment." });
  }
};

const payInstallments = async (req, res) => {
  try {
    const { membershipId } = req.body;
    if (!membershipId) {
      return res.status(400).json({ message: "membershipId is required." });
    }

    const membership = await membershipRepository.findOne({
      id: membershipId,
      user_id: req.user.id,
    });
    if (!membership || membership.status !== "investor") {
      return res.status(400).json({ message: "Only investors can pay installments." });
    }

    let ids = req.body.installmentIds;
    if (!ids) return res.status(400).json({ message: "No installments selected." });
    if (!Array.isArray(ids)) ids = [ids];

    const invoiceUrl = req.file?.path || "";
    if (!invoiceUrl) {
      return res.status(400).json({ message: "An invoice file is required." });
    }

    const payment = buildPaymentInfo(req.body);
    if (payment.error) return res.status(400).json({ message: payment.error });

    const entries = await investmentLedgerRepository.db('investment_ledgers').whereIn('id', ids).andWhere({
      membership_id: membership.id,
      type: "installment",
      status: "Unpaid",
    });

    if (entries.length === 0) {
      return res.status(400).json({ message: "No valid unpaid installments to submit." });
    }

    const batchId = crypto.randomUUID();
    const now = new Date();

    await investmentLedgerRepository.db('investment_ledgers')
      .whereIn('id', entries.map((e) => e.id))
      .update({
          status: "Pending",
          payment_method: payment.method,
          payment_details: JSON.stringify(payment.details),
          invoice_url: invoiceUrl,
          description: req.body.description || "",
          batch_id: batchId,
          submitted_at: now,
      });

    res.status(200).json({
      message: `${entries.length} installment(s) submitted. Awaiting admin approval.`,
      batchId,
      count: entries.length,
    });
  } catch (error) {
    console.error("Error submitting installments:", error);
    res.status(500).json({ message: "Server error submitting installments." });
  }
};

module.exports = {
  getMyMembership,
  getMyMembershipDetail,
  submitBooking,
  submitDownPayment,
  payInstallments,
};
