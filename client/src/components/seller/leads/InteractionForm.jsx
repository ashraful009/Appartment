import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Loader2, Send, MessageCircle, Users } from "lucide-react";

const InteractionForm = ({ leadId, leadUser, onSuccess }) => {
  const [form, setForm] = useState({
    interactionType: "Call",
    notes: "",
    scheduleFollowUp: false,
    nextMeetingDate: "",
    nextMeetingAgenda: "",
    inviteMentor: false,
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.notes.trim()) { toast.error("Please add a note."); return; }
    setSubmitting(true);
    try {
      const agendaText = form.scheduleFollowUp
        ? form.inviteMentor
          ? `${form.nextMeetingAgenda} [JOINT MEETING]`.trim()
          : form.nextMeetingAgenda
        : "";

      await axios.post("/api/interactions", {
        leadId,
        interactionType: form.interactionType,
        notes: form.notes,
        nextMeetingDate: form.scheduleFollowUp ? form.nextMeetingDate : null,
        nextMeetingAgenda: agendaText,
        isJointMeeting: form.scheduleFollowUp && form.inviteMentor,
      }, { withCredentials: true });
      toast.success("Interaction logged!");
      setForm({ interactionType: "Call", notes: "", scheduleFollowUp: false, nextMeetingDate: "", nextMeetingAgenda: "", inviteMentor: false });
      onSuccess();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to log interaction.");
    } finally { setSubmitting(false); }
  };

  const phone = leadUser?.phone?.replace(/[^0-9]/g, "");
  const waText = encodeURIComponent(`Hello ${leadUser?.name || "there"}, this is a follow-up regarding your property inquiry. How can I help you today?`);

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Interaction Type */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">Interaction Type</label>
        <select
          name="interactionType"
          value={form.interactionType}
          onChange={handleChange}
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white"
        >
          {["Call", "WhatsApp", "Meeting", "Document Sent", "Note"].map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">
          Notes <span className="text-red-400">*</span>
        </label>
        <textarea
          name="notes"
          value={form.notes}
          onChange={handleChange}
          rows={3}
          placeholder="What did you discuss / do?"
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none"
        />
      </div>

      {/* Schedule Follow-up */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            name="scheduleFollowUp"
            checked={form.scheduleFollowUp}
            onChange={handleChange}
            className="w-4 h-4 accent-brand-500 cursor-pointer"
          />
          <span className="text-xs font-semibold text-gray-600">Schedule Follow-up</span>
        </label>
        {form.scheduleFollowUp && (
          <div className="mt-2 space-y-2 pl-6">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Date &amp; Time</label>
              <input
                type="datetime-local"
                name="nextMeetingDate"
                value={form.nextMeetingDate}
                onChange={handleChange}
                className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Agenda</label>
              <input
                type="text"
                name="nextMeetingAgenda"
                value={form.nextMeetingAgenda}
                onChange={handleChange}
                placeholder="e.g. Site visit at Block B"
                className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer pt-1 border-t border-purple-100">
              <input
                type="checkbox"
                name="inviteMentor"
                checked={form.inviteMentor}
                onChange={handleChange}
                className="w-4 h-4 accent-purple-500 cursor-pointer"
              />
              <span className="text-xs font-semibold text-purple-700 flex items-center gap-1">
                <Users size={11} /> Invite Mentor to Joint Meeting
              </span>
            </label>
            {form.inviteMentor && (
              <p className="text-xs text-purple-500 italic pl-6">
                Your mentor will see a Joint Meeting tag in their overview.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={submitting}
        className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-semibold text-sm py-2.5 rounded-xl transition-colors"
      >
        {submitting ? <Loader2 size={15} className="animate-spin" /> : <Send size={14} />}
        {submitting ? "Logging..." : "Log Interaction"}
      </button>

      {/* WhatsApp Quick Action */}
      {phone && (
        <button
          type="button"
          onClick={() => window.open(`https://wa.me/${phone}?text=${waText}`, "_blank")}
          className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold text-sm py-2.5 rounded-xl transition-colors"
        >
          <MessageCircle size={14} />
          Send WhatsApp
        </button>
      )}
    </form>
  );
};

export default InteractionForm;
