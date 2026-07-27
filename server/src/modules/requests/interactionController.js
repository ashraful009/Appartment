const priceRequestRepository = require("../../repositories/PriceRequestRepository");
const interactionRepository = require("../../repositories/InteractionRepository");
const notificationRepository = require("../../repositories/NotificationRepository");
const userRepository = require("../../repositories/UserRepository");
const { whereJsonArrayContains, withGeneratedIds } = require("../../utils/dbUtils");

const addInteraction = async (req, res) => {
  try {
    const {
      leadId,
      interactionType,
      notes,
      nextMeetingDate,
      nextMeetingAgenda,
      isJointMeeting,
    } = req.body;

    if (!leadId || !interactionType || !notes) {
      return res.status(400).json({ message: "leadId, interactionType, and notes are required." });
    }

    const lead = await priceRequestRepository.db('price_requests')
        .where({ 'price_requests.id': leadId, 'price_requests.assigned_to': req.user.id })
        .leftJoin('users', 'price_requests.user_id', 'users.id')
        .select('price_requests.*', 'users.name as userName')
        .first();

    if (!lead) {
      return res.status(404).json({ message: "Lead not found or not assigned to you." });
    }

    const interaction = await interactionRepository.create({
      lead_id: leadId,
      seller_id: req.user.id,
      interaction_type: interactionType,
      notes,
      next_meeting_date: nextMeetingDate || null,
      next_meeting_agenda: nextMeetingAgenda || "",
      is_joint_meeting: isJointMeeting || false,
    });

    await priceRequestRepository.update(leadId, { last_interaction_date: new Date() });

    if (/@admin/i.test(notes)) {
      const seller = req.user;
      const admins = await whereJsonArrayContains(userRepository.db('users'), 'roles', 'admin').select('id');
      const leadName = lead.userName || "Unknown Lead";

      if (admins.length) {
        const adminNotifications = admins.map((a) => ({
          recipient_id: a.id,
          sender_id: seller.id,
          message: `Seller ${seller.name} mentioned you in a lead: ${leadName}.`,
          type: "MentorRequest",
        }));
        await notificationRepository.db('notifications').insert(withGeneratedIds(adminNotifications));
      }
    }

    const formattedInteraction = {
        _id: interaction.id,
        leadId: interaction.lead_id,
        sellerId: interaction.seller_id,
        interactionType: interaction.interaction_type,
        notes: interaction.notes,
        nextMeetingDate: interaction.next_meeting_date,
        nextMeetingAgenda: interaction.next_meeting_agenda,
        isJointMeeting: interaction.is_joint_meeting,
        isMentorRequested: interaction.is_mentor_requested,
        adminNote: interaction.admin_note,
        followUpStatus: interaction.follow_up_status,
        date: interaction.date
    };

    res.status(201).json({ message: "Interaction logged successfully.", interaction: formattedInteraction });
  } catch (error) {
    console.error("addInteraction error:", error);
    res.status(500).json({ message: "Failed to log interaction." });
  }
};

const getInteractionsByLead = async (req, res) => {
  try {
    const { leadId } = req.params;

    const lead = await priceRequestRepository.findOne({ id: leadId, assigned_to: req.user.id });
    if (!lead) {
      return res.status(404).json({ message: "Lead not found or not assigned to you." });
    }

    const interactions = await interactionRepository.db('interactions')
      .where({ lead_id: leadId })
      .leftJoin('users', 'interactions.seller_id', 'users.id')
      .orderBy('date', 'desc')
      .select('interactions.*', 'users.name as sellerName');

    const formattedInteractions = interactions.map(interaction => ({
        _id: interaction.id,
        leadId: interaction.lead_id,
        sellerId: { _id: interaction.seller_id, name: interaction.sellerName },
        interactionType: interaction.interaction_type,
        notes: interaction.notes,
        nextMeetingDate: interaction.next_meeting_date,
        nextMeetingAgenda: interaction.next_meeting_agenda,
        isJointMeeting: interaction.is_joint_meeting,
        isMentorRequested: interaction.is_mentor_requested,
        adminNote: interaction.admin_note,
        followUpStatus: interaction.follow_up_status,
        date: interaction.date
    }));

    res.status(200).json({ interactions: formattedInteractions });
  } catch (error) {
    console.error("getInteractionsByLead error:", error);
    res.status(500).json({ message: "Failed to fetch interactions." });
  }
};

const requestMentorHelp = async (req, res) => {
  try {
    const interaction = await interactionRepository.findOne({
      id: req.params.id,
      seller_id: req.user.id,
    });

    if (!interaction) {
      return res.status(404).json({ message: "Interaction not found or not yours." });
    }

    const updatedInteraction = await interactionRepository.update(interaction.id, { is_mentor_requested: true });

    const currentSeller = await userRepository.findById(req.user.id, ['referred_by', 'name']);
    if (currentSeller?.referred_by) {
      await notificationRepository.create({
        recipient_id: currentSeller.referred_by,
        sender_id: req.user.id,
        message: `${currentSeller.name} is requesting your mentorship on a lead interaction.`,
        type: "MentorRequest",
      });
    }

    const formattedInteraction = {
        ...updatedInteraction,
        _id: updatedInteraction.id,
        isMentorRequested: updatedInteraction.is_mentor_requested
    };

    res.status(200).json({
      message: "Mentor help requested. Your mentor has been notified.",
      interaction: formattedInteraction,
    });
  } catch (error) {
    console.error("requestMentorHelp error:", error);
    res.status(500).json({ message: "Failed to request mentor help." });
  }
};

const setAdminNote = async (req, res) => {
  try {
    const { adminNote } = req.body;
    if (!adminNote?.trim()) {
      return res.status(400).json({ message: "adminNote is required." });
    }

    const interaction = await interactionRepository.findById(req.params.id);
    if (!interaction) {
      return res.status(404).json({ message: "Interaction not found." });
    }

    const updatedInteraction = await interactionRepository.update(interaction.id, { admin_note: adminNote.trim() });

    await notificationRepository.create({
      recipient_id: interaction.seller_id,
      sender_id: req.user.id,
      message: "Admin left a directive on your lead.",
      type: "General",
    });

    const formattedInteraction = {
        ...updatedInteraction,
        _id: updatedInteraction.id,
        adminNote: updatedInteraction.admin_note
    };

    res.status(200).json({
      message: "Admin note saved. Seller has been notified.",
      interaction: formattedInteraction,
    });
  } catch (error) {
    console.error("setAdminNote error:", error);
    res.status(500).json({ message: "Failed to save admin note." });
  }
};

const VALID_FOLLOWUP_STATUSES = ["Pending", "Completed", "Unable to Contact"];

const updateFollowUpStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status || !VALID_FOLLOWUP_STATUSES.includes(status)) {
      return res.status(400).json({
        message: `status must be one of: ${VALID_FOLLOWUP_STATUSES.join(", ")}.`,
      });
    }

    const interaction = await interactionRepository.findOne({
      id: req.params.id,
      seller_id: req.user.id,
    });

    if (!interaction) {
      return res.status(404).json({ message: "Interaction not found or not yours." });
    }

    const updatedInteraction = await interactionRepository.update(interaction.id, { follow_up_status: status });

    const formattedInteraction = {
        ...updatedInteraction,
        _id: updatedInteraction.id,
        followUpStatus: updatedInteraction.follow_up_status
    };

    res.status(200).json({
      message: `Follow-up status updated to "${status}".`,
      interaction: formattedInteraction,
    });
  } catch (error) {
    console.error("updateFollowUpStatus error:", error);
    res.status(500).json({ message: "Failed to update follow-up status." });
  }
};

module.exports = { addInteraction, getInteractionsByLead, requestMentorHelp, setAdminNote, updateFollowUpStatus };
