const mongoose = require("mongoose");

const interactionSchema = new mongoose.Schema(
  {
    // ── Core References ────────────────────────────────────────────────────
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PriceRequest",
      required: [true, "leadId is required"],
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "sellerId is required"],
    },

    // ── Interaction Details ───────────────────────────────────────────────
    interactionType: {
      type: String,
      enum: ["Call", "WhatsApp", "Meeting", "Document Sent", "Note"],
      required: [true, "interactionType is required"],
    },
    notes: {
      type: String,
      required: [true, "notes are required"],
      trim: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },

    // ── Follow-up Fields ──────────────────────────────────────────────────
    nextMeetingDate:   { type: Date,    default: null },
    nextMeetingAgenda: { type: String,  default: "" },
    isJointMeeting:    { type: Boolean, default: false },

    // ── Collaboration Fields ──────────────────────────────────────────────
    adminNote:         { type: String,  default: "" },
    mentorNote:        { type: String,  default: "" },
    isMentorRequested: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Index for efficient per-lead and per-seller lookups
interactionSchema.index({ leadId: 1, date: -1 });
interactionSchema.index({ sellerId: 1, nextMeetingDate: 1 });

module.exports = mongoose.model("Interaction", interactionSchema);
