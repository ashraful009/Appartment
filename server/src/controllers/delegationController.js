const priceRequestRepository = require("../repositories/PriceRequestRepository");
const interactionRepository = require("../repositories/InteractionRepository");
const notificationRepository = require("../repositories/NotificationRepository");
const userRepository = require("../repositories/UserRepository");
const { whereJsonArrayContains, withGeneratedIds } = require("../utils/dbUtils");

const delegateLead = async (req, res) => {
  try {
    const { targetSellerId } = req.body;
    if (!targetSellerId) {
      return res.status(400).json({ message: "targetSellerId is required." });
    }

    const lead = await priceRequestRepository.db('price_requests')
        .where({ 'price_requests.id': req.params.id, 'price_requests.assigned_to': req.user.id })
        .leftJoin('users', 'price_requests.user_id', 'users.id')
        .select('price_requests.*', 'users.name as userName')
        .first();

    if (!lead) {
      return res.status(404).json({ message: "Lead not found or not assigned to you." });
    }

    const subSeller = await whereJsonArrayContains(userRepository.db('users').where({
      id: targetSellerId,
      referred_by: req.user.id,
    }), 'roles', 'seller').select('name', 'id').first();

    if (!subSeller) {
      return res.status(403).json({
        message: "Target seller must be one of your direct sub-sellers.",
      });
    }

    const updatedLead = await priceRequestRepository.update(lead.id, {
        assigned_to: subSeller.id,
        assigned_at: new Date()
    });

    await interactionRepository.create({
      lead_id: lead.id,
      seller_id: req.user.id,
      interaction_type: "Note",
      notes: `Lead delegated to sub-seller: ${subSeller.name}.`,
      admin_note: `Delegated by parent seller on ${new Date().toLocaleDateString("en-GB")}.`,
    });

    await notificationRepository.create({
      recipient_id: subSeller.id,
      sender_id: req.user.id,
      message: `A lead has been delegated to you by your mentor.`,
      type: "LeadDelegated",
    });

    res.status(200).json({
      message: `Lead successfully delegated to ${subSeller.name}.`,
      lead: { ...updatedLead, _id: updatedLead.id },
    });
  } catch (error) {
    console.error("delegateLead error:", error);
    res.status(500).json({ message: "Failed to delegate lead." });
  }
};

const COMMISSION_PER_CONVERSION = 5000;

const getTeamOverview = async (req, res) => {
  try {
    const teamRaw = await whereJsonArrayContains(userRepository.db('users')
      .where({ referred_by: req.user.id })
      , 'roles', 'seller')
      .select('id as _id', 'name', 'phone');

    const team = await Promise.all(teamRaw.map(async (u) => {
        const leadsRaw = await priceRequestRepository.db('price_requests')
            .where({ assigned_to: u._id })
            .leftJoin('users', 'price_requests.user_id', 'users.id')
            .select('price_requests.*', 'users.name as userName', 'users.email as userEmail', 'users.phone as userPhone');
            
        const leads = leadsRaw.map(l => ({
            ...l,
            _id: l.id,
            conversionStatus: l.conversion_status,
            user: { _id: l.user_id, name: l.userName, email: l.userEmail, phone: l.userPhone }
        }));
            
        const convertedLeads = leads.filter(l => l.conversion_status === 'approved').length;
            
        return {
            ...u,
            totalLeads: leads.length,
            convertedLeads,
            leads
        };
    }));

    const totalConversions  = team.reduce((sum, s) => sum + s.convertedLeads, 0);
    const totalTeamEarnings = totalConversions * COMMISSION_PER_CONVERSION;

    res.status(200).json({ team, totalConversions, totalTeamEarnings });
  } catch (error) {
    console.error("getTeamOverview error:", error);
    res.status(500).json({ message: "Failed to fetch team overview." });
  }
};

const broadcastToTeam = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message?.trim()) {
      return res.status(400).json({ message: "Broadcast message is required." });
    }

    const subSellers = await whereJsonArrayContains(userRepository.db('users').where({
      referred_by: req.user.id,
    }), 'roles', 'seller').select('id');

    if (!subSellers.length) {
      return res.status(200).json({ message: "No sub-sellers to broadcast to.", sent: 0 });
    }

    const notifications = subSellers.map((s) => ({
      recipient_id: s.id,
      sender_id: req.user.id,
      message: message.trim(),
      type: "Broadcast",
    }));

    await notificationRepository.db('notifications').insert(withGeneratedIds(notifications));

    res.status(201).json({
      message: `Broadcast sent to ${subSellers.length} sub-seller(s).`,
      sent: subSellers.length,
    });
  } catch (error) {
    console.error("broadcastToTeam error:", error);
    res.status(500).json({ message: "Failed to broadcast message." });
  }
};

module.exports = { delegateLead, getTeamOverview, broadcastToTeam };
