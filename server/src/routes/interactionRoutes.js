const express = require("express");
const router  = express.Router();

const { protect }        = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/authMiddleware");
const interactionRepository = require("../repositories/InteractionRepository");

const { addInteraction, getInteractionsByLead, requestMentorHelp, setAdminNote, updateFollowUpStatus } = require("../controllers/interactionController");

const sellerGuard = [protect, authorizeRoles("seller")];
const adminGuard  = [protect, authorizeRoles("admin")];

// POST /api/interactions — Seller logs a new interaction for a lead
router.post("/", sellerGuard, addInteraction);

// GET /api/interactions/admin/:leadId — Admin views any lead's full timeline (no ownership check)
router.get("/admin/:leadId", adminGuard, async (req, res) => {
  try {
    const interactionsRaw = await interactionRepository.db('interactions')
      .where({ lead_id: req.params.leadId })
      .leftJoin('users', 'interactions.seller_id', 'users.id')
      .orderBy('date', 'desc')
      .select('interactions.*', 'users.name as sellerName');
      
    const interactions = interactionsRaw.map(i => ({
        ...i,
        _id: i.id,
        leadId: i.lead_id,
        sellerId: { _id: i.seller_id, name: i.sellerName },
        interactionType: i.interaction_type,
        nextMeetingDate: i.next_meeting_date,
        nextMeetingAgenda: i.next_meeting_agenda,
        isJointMeeting: i.is_joint_meeting,
        isMentorRequested: i.is_mentor_requested,
        adminNote: i.admin_note,
        followUpStatus: i.follow_up_status
    }));
      
    res.status(200).json({ interactions });
  } catch (error) {
    console.error("admin getInteractions error:", error);
    res.status(500).json({ message: "Failed to fetch interactions." });
  }
});

// GET /api/interactions/:leadId — Fetch all interactions for a specific lead (seller)
router.get("/:leadId", sellerGuard, getInteractionsByLead);

// PUT /api/interactions/:id/followup-status — Seller updates a task's follow-up status
router.put("/:id/followup-status", sellerGuard, updateFollowUpStatus);

// PUT /api/interactions/:id/request-mentor — Flag interaction for mentor help
router.put("/:id/request-mentor", sellerGuard, requestMentorHelp);

// PUT /api/interactions/:id/admin-note — Admin sets a directive on an interaction
router.put("/:id/admin-note", adminGuard, setAdminNote);

module.exports = router;
