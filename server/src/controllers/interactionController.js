const PriceRequest  = require("../models/PriceRequest");
const Interaction   = require("../models/Interaction");
const Notification  = require("../models/Notification");
const User          = require("../models/User");

// ─────────────────────────────────────────────────────────────
// @desc   Add a new interaction / touchpoint for a lead
// @route  POST /api/interactions
// @access Private (seller)
// ─────────────────────────────────────────────────────────────
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

    // Verify this lead is actually assigned to this seller
    const lead = await PriceRequest.findOne({ _id: leadId, assignedTo: req.user._id })
      .populate("user", "name");
    if (!lead) {
      return res.status(404).json({ message: "Lead not found or not assigned to you." });
    }

    const interaction = await Interaction.create({
      leadId,
      sellerId:          req.user._id,
      interactionType,
      notes,
      nextMeetingDate:   nextMeetingDate   || null,
      nextMeetingAgenda: nextMeetingAgenda || "",
      isJointMeeting:    isJointMeeting    || false,
    });

    // Automatically update the parent lead's lastInteractionDate
    lead.lastInteractionDate = new Date();
    await lead.save();

    // ── @admin mention detection ──────────────────────────────
    if (/@admin/i.test(notes)) {
      const seller  = req.user;     // populated by protect middleware
      const admins  = await User.find({ roles: "admin" }).select("_id");
      const leadName = lead.user?.name || "Unknown Lead";

      if (admins.length) {
        const adminNotifications = admins.map((a) => ({
          recipientId: a._id,
          senderId:    seller._id,
          message:     `Seller ${seller.name} mentioned you in a lead: ${leadName}.`,
          type:        "MentorRequest", // reuse closest type
        }));
        await Notification.insertMany(adminNotifications);
      }
    }

    res.status(201).json({ message: "Interaction logged successfully.", interaction });
  } catch (error) {
    console.error("addInteraction error:", error);
    res.status(500).json({ message: "Failed to log interaction." });
  }
};

// ─────────────────────────────────────────────────────────────
// @desc   Get all interactions for a specific lead (newest first)
// @route  GET /api/interactions/:leadId
// @access Private (seller)
// ─────────────────────────────────────────────────────────────
const getInteractionsByLead = async (req, res) => {
  try {
    const { leadId } = req.params;

    // Verify the seller has access to this lead
    const lead = await PriceRequest.findOne({ _id: leadId, assignedTo: req.user._id });
    if (!lead) {
      return res.status(404).json({ message: "Lead not found or not assigned to you." });
    }

    const interactions = await Interaction.find({ leadId })
      .populate("sellerId", "name")
      .sort({ date: -1 });

    res.status(200).json({ interactions });
  } catch (error) {
    console.error("getInteractionsByLead error:", error);
    res.status(500).json({ message: "Failed to fetch interactions." });
  }
};

// ─────────────────────────────────────────────────────────────
// @desc   Request mentor help on a specific interaction
// @route  PUT /api/interactions/:id/request-mentor
// @access Private (seller)
// ─────────────────────────────────────────────────────────────
const requestMentorHelp = async (req, res) => {
  try {
    const interaction = await Interaction.findOne({
      _id:      req.params.id,
      sellerId: req.user._id,
    });

    if (!interaction) {
      return res.status(404).json({ message: "Interaction not found or not yours." });
    }

    interaction.isMentorRequested = true;
    await interaction.save();

    // Notify the parent seller (mentor)
    const currentSeller = await User.findById(req.user._id).select("referredBy name");
    if (currentSeller?.referredBy) {
      await Notification.create({
        recipientId: currentSeller.referredBy,
        senderId:    req.user._id,
        message:     `${currentSeller.name} is requesting your mentorship on a lead interaction.`,
        type:        "MentorRequest",
      });
    }

    res.status(200).json({
      message: "Mentor help requested. Your mentor has been notified.",
      interaction,
    });
  } catch (error) {
    console.error("requestMentorHelp error:", error);
    res.status(500).json({ message: "Failed to request mentor help." });
  }
};

// ─────────────────────────────────────────────────────────────
// @desc   Admin sets / updates a directive (adminNote) on an interaction
// @route  PUT /api/interactions/:id/admin-note
// @access Private (admin)
// ─────────────────────────────────────────────────────────────
const setAdminNote = async (req, res) => {
  try {
    const { adminNote } = req.body;
    if (!adminNote?.trim()) {
      return res.status(400).json({ message: "adminNote is required." });
    }

    const interaction = await Interaction.findById(req.params.id);
    if (!interaction) {
      return res.status(404).json({ message: "Interaction not found." });
    }

    interaction.adminNote = adminNote.trim();
    await interaction.save();

    // Notify the seller who logged this interaction
    await Notification.create({
      recipientId: interaction.sellerId,
      senderId:    req.user._id,
      message:     "Admin left a directive on your lead.",
      type:        "General",
    });

    res.status(200).json({
      message: "Admin note saved. Seller has been notified.",
      interaction,
    });
  } catch (error) {
    console.error("setAdminNote error:", error);
    res.status(500).json({ message: "Failed to save admin note." });
  }
};

module.exports = { addInteraction, getInteractionsByLead, requestMentorHelp, setAdminNote };
