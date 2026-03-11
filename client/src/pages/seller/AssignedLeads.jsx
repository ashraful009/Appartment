import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  MapPin, Mail, Phone, Building2, InboxIcon, CheckCircle2, Loader2,
  ChevronDown, ChevronUp, Phone as PhoneIcon, MessageCircle, Users,
  FileText, StickyNote, Calendar, Clock, Send, AlertCircle, X,
  UserCheck, GitBranch, AlertTriangle, HelpCircle, CheckCheck,
} from "lucide-react";

// ── Delegation Modal ───────────────────────────────────────────────────────────
const DelegateModal = ({ lead, onClose, onDelegated }) => {
  const [subSellers, setSubSellers] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    axios.get("/api/seller/team-overview", { withCredentials: true })
      .then(({ data }) => setSubSellers(data.team))
      .catch(() => toast.error("Could not load sub-sellers."))
      .finally(() => setLoading(false));
  }, []);

  const handleDelegate = async () => {
    if (!selectedId) { toast.error("Please select a sub-seller."); return; }
    setSubmitting(true);
    try {
      const { data } = await axios.put(
        `/api/requests/${lead._id}/delegate`,
        { targetSellerId: selectedId },
        { withCredentials: true }
      );
      toast.success(data.message || "Lead delegated!");
      onDelegated(lead._id);
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Delegation failed.");
    } finally { setSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-0.5">Delegate Lead</p>
            <h3 className="text-base font-extrabold text-gray-800">{lead.user?.name || "Lead"}</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
            <X size={16} className="text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <p className="text-sm text-gray-500">
            Select one of your sub-sellers to transfer this lead. A delegation note will be auto-logged.
          </p>
          {loading ? (
            <div className="h-10 bg-gray-100 rounded-xl animate-pulse" />
          ) : subSellers.length === 0 ? (
            <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
              You have no sub-sellers to delegate to.
            </p>
          ) : (
            <select
              value={selectedId}
              onChange={e => setSelectedId(e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white"
            >
              <option value="">— Select a sub-seller —</option>
              {subSellers.map(s => (
                <option key={s._id} value={s._id}>
                  {s.name} ({s.totalLeads} leads, {s.convertedLeads} converted)
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelegate}
            disabled={submitting || !selectedId || subSellers.length === 0}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-sm font-semibold transition-colors"
          >
            {submitting ? <Loader2 size={14} className="animate-spin" /> : <UserCheck size={14} />}
            {submitting ? "Delegating…" : "Confirm Delegate"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const isToday = (dateStr) => {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const today = new Date();
  return (
    d.getFullYear() === today.getFullYear() &&
    d.getMonth()    === today.getMonth()    &&
    d.getDate()     === today.getDate()
  );
};

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const formatDateTime = (d) => {
  if (!d) return "—";
  const dt = new Date(d);
  return `${dt.toLocaleDateString("en-GB", { day: "2-digit", month: "short" })} · ${dt.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`;
};

// ── Pipeline & Priority configs ───────────────────────────────────────────────
const PIPELINE_STAGES = ["New", "Contacted", "Site Visited", "Negotiation", "Closed Won", "Closed Lost"];
const PRIORITIES = ["Hot", "Warm", "Cold"];

const STAGE_COLORS = {
  "New": "bg-gray-100 text-gray-600",
  "Contacted": "bg-blue-100 text-blue-700",
  "Site Visited": "bg-purple-100 text-purple-700",
  "Negotiation": "bg-amber-100 text-amber-700",
  "Closed Won": "bg-emerald-100 text-emerald-700",
  "Closed Lost": "bg-red-100 text-red-500",
};

const PRIORITY_COLORS = {
  "Hot": "bg-red-100 text-red-600",
  "Warm": "bg-amber-100 text-amber-600",
  "Cold": "bg-blue-100 text-blue-600",
};

// ── Interaction type icons ────────────────────────────────────────────────────
const TYPE_ICON = {
  "Call": <PhoneIcon size={14} className="text-blue-500" />,
  "WhatsApp": <MessageCircle size={14} className="text-green-500" />,
  "Meeting": <Users size={14} className="text-purple-500" />,
  "Document Sent": <FileText size={14} className="text-orange-500" />,
  "Note": <StickyNote size={14} className="text-gray-400" />,
};

const TYPE_DOT = {
  "Call": "bg-blue-500",
  "WhatsApp": "bg-green-500",
  "Meeting": "bg-purple-500",
  "Document Sent": "bg-orange-500",
  "Note": "bg-gray-400",
};

// ── Reusable Status Toggle ────────────────────────────────────────────────────
const StatusToggle = ({ req, statusKey, endpoint, onStatusChange, approvedLabel, approvedColor = "emerald" }) => {
  const [loading, setLoading] = useState(false);
  const status = req[statusKey];

  if (status === "approved") {
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-${approvedColor}-100 text-${approvedColor}-700 text-xs font-semibold`}>
        <CheckCircle2 size={12} />{approvedLabel}
      </span>
    );
  }
  if (status === "pending_approval") {
    return (
      <div className="relative group flex items-center gap-2">
        <button disabled className="relative inline-flex w-11 h-6 items-center rounded-full bg-brand-500 opacity-60 cursor-not-allowed">
          <span className="inline-block w-4 h-4 bg-white rounded-full shadow transform translate-x-6" />
        </button>
        <span className="text-xs text-amber-600 font-medium whitespace-nowrap">Pending</span>
        <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-20">
          <div className="bg-gray-800 text-white text-xs rounded-lg px-3 py-1.5 whitespace-nowrap shadow-lg">
            Awaiting admin approval
            <div className="absolute top-full left-4 border-4 border-transparent border-t-gray-800" />
          </div>
        </div>
      </div>
    );
  }
  const handleToggle = async () => {
    setLoading(true);
    try {
      await axios.put(endpoint, {}, { withCredentials: true });
      toast.success("Request sent! Awaiting admin approval.");
      onStatusChange(req._id, "pending_approval", statusKey);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to submit request.");
    } finally { setLoading(false); }
  };
  return (
    <div className="flex items-center gap-2.5">
      {loading ? (
        <Loader2 size={20} className="animate-spin text-brand-500" />
      ) : (
        <button onClick={handleToggle} className="relative inline-flex w-11 h-6 items-center rounded-full bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-1 transition-colors cursor-pointer">
          <span className="inline-block w-4 h-4 bg-white rounded-full shadow transform translate-x-1" />
        </button>
      )}
      {status === "rejected" && <span className="text-xs text-red-500 font-medium">Rejected</span>}
    </div>
  );
};

// ── Activity Timeline ─────────────────────────────────────────────────────────
const ActivityTimeline = ({ leadId, refreshKey }) => {
  const [interactions, setInteractions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [askingHelp, setAskingHelp] = useState(null); // interactionId being prompted
  const [helpNote, setHelpNote] = useState("");
  const [helpSending, setHelpSending] = useState(false);

  useEffect(() => {
    if (!leadId) return;
    setLoading(true);
    axios.get(`/api/interactions/${leadId}`, { withCredentials: true })
      .then(({ data }) => setInteractions(data.interactions))
      .catch(() => { })
      .finally(() => setLoading(false));
  }, [leadId, refreshKey]);

  const handleRequestMentor = async (interactionId) => {
    if (!helpNote.trim()) { toast.error("Please add a quick note for your mentor."); return; }
    setHelpSending(true);
    try {
      await axios.put(`/api/interactions/${interactionId}/request-mentor`, {}, { withCredentials: true });
      toast.success("Mentor notified! Help request sent.");
      setInteractions(prev =>
        prev.map(i => i._id === interactionId ? { ...i, isMentorRequested: true } : i)
      );
      setAskingHelp(null);
      setHelpNote("");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to request mentor help.");
    } finally { setHelpSending(false); }
  };

  if (loading) return (
    <div className="space-y-3">
      {[1, 2, 3].map(i => (
        <div key={i} className="flex gap-3 animate-pulse">
          <div className="w-3 h-3 bg-gray-200 rounded-full mt-1 flex-shrink-0" />
          <div className="flex-1 space-y-1.5 pb-4 border-l border-gray-100 pl-3">
            <div className="h-3 bg-gray-200 rounded w-24" />
            <div className="h-3 bg-gray-100 rounded w-full" />
          </div>
        </div>
      ))}
    </div>
  );

  if (!interactions.length) return (
    <div className="text-center py-8 text-gray-400">
      <MessageCircle size={32} className="mx-auto mb-2 opacity-40" />
      <p className="text-sm">No interactions yet. Log the first one →</p>
    </div>
  );

  return (
    <div className="relative">
      <div className="absolute left-1.5 top-2 bottom-0 w-px bg-gray-200" />
      <div className="space-y-4">
        {interactions.map((item) => (
          <div key={item._id} className="flex gap-4 relative">
            {/* Timeline dot */}
            <div className={`w-3 h-3 rounded-full flex-shrink-0 mt-1.5 border-2 border-white ring-1 ring-gray-200 ${TYPE_DOT[item.interactionType] || "bg-gray-300"}`} />
            <div className="flex-1 pb-4">
              {/* Mentor-help badge */}
              {item.isMentorRequested && (
                <div className="flex items-center gap-1.5 mb-1.5 text-xs font-bold text-red-600 bg-red-50 border border-red-200 rounded-lg px-2 py-1">
                  <AlertTriangle size={11} /> Help Requested — Mentor Notified
                </div>
              )}
              {/* Joint-meeting badge */}
              {item.isJointMeeting && (
                <div className="flex items-center gap-1.5 mb-1.5 text-xs font-semibold text-purple-700 bg-purple-50 border border-purple-200 rounded-lg px-2 py-1">
                  <Users size={11} /> Joint Meeting Scheduled
                </div>
              )}
              {/* Header */}
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                  {TYPE_ICON[item.interactionType]}{item.interactionType}
                </span>
                <span className="text-xs text-gray-400">{formatDateTime(item.date)}</span>
                {item.sellerId?.name && (
                  <span className="text-xs text-gray-400 italic">by {item.sellerId.name}</span>
                )}
              </div>
              {/* Notes */}
              <p className="text-sm text-gray-700 leading-relaxed">{item.notes}</p>
              {/* Admin Directive — high-visibility banner */}
              {item.adminNote && (
                <div className="mt-2 bg-red-50 border-l-4 border-red-500 border border-red-200 rounded-xl px-3 py-2.5">
                  <p className="text-xs font-extrabold text-red-600 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                    🚨 Admin Instruction
                  </p>
                  <p className="text-sm font-semibold text-red-800 leading-relaxed">{item.adminNote}</p>
                </div>
              )}
              {/* Follow-up */}
              {item.nextMeetingDate && (
                <div className="mt-2 inline-flex items-center gap-1.5 text-xs bg-purple-50 text-purple-600 border border-purple-200 px-2 py-1 rounded-lg">
                  <Calendar size={11} />
                  Follow-up: {formatDateTime(item.nextMeetingDate)}
                  {item.nextMeetingAgenda && ` · ${item.nextMeetingAgenda}`}
                </div>
              )}
              {/* Ask Mentor button — only if not already requested */}
              {!item.isMentorRequested && (
                askingHelp === item._id ? (
                  <div className="mt-2 bg-red-50 border border-red-200 rounded-lg p-2.5 space-y-2">
                    <p className="text-xs font-semibold text-red-600 flex items-center gap-1">
                      <HelpCircle size={12} /> Quick note for your mentor:
                    </p>
                    <textarea
                      rows={2}
                      value={helpNote}
                      onChange={e => setHelpNote(e.target.value)}
                      placeholder="e.g. Client is very difficult, need your advice…"
                      className="w-full text-xs border border-red-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-red-400 resize-none"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setAskingHelp(null); setHelpNote(""); }}
                        className="flex-1 text-xs py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleRequestMentor(item._id)}
                        disabled={helpSending}
                        className="flex-1 flex items-center justify-center gap-1 text-xs py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold disabled:opacity-60"
                      >
                        {helpSending ? <Loader2 size={11} className="animate-spin" /> : <AlertTriangle size={11} />}
                        {helpSending ? "Sending…" : "Notify Mentor"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setAskingHelp(item._id)}
                    className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 border border-red-200 px-2.5 py-1 rounded-lg transition-colors"
                  >
                    <HelpCircle size={11} /> Ask Mentor to Intervene
                  </button>
                )
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── New Interaction Form ───────────────────────────────────────────────────────
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
      // Build agenda — append [JOINT MEETING] tag if mentor is invited
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
        <label className="block text-xs font-semibold text-gray-500 mb-1">Notes <span className="text-red-400">*</span></label>
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
            {/* Joint Meeting Invite */}
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

// ── Pipeline Column ───────────────────────────────────────────────────────────
const PipelineColumn = ({ req, onUpdate }) => {
  const [stage, setStage] = useState(req.pipelineStage || "New");
  const [priority, setPriority] = useState(req.priority || "Warm");
  const [prefs, setPrefs] = useState({
    budget: req.clientPreferences?.budget || "",
    location: req.clientPreferences?.location || "",
  });
  const [saving, setSaving] = useState(false);

  const save = useCallback(
    async (overrides = {}) => {
      setSaving(true);
      try {
        const payload = {
          pipelineStage: overrides.stage ?? stage,
          priority: overrides.priority ?? priority,
          clientPreferences: overrides.prefs ?? prefs,
        };
        const { data } = await axios.put(`/api/requests/${req._id}/pipeline`, payload, { withCredentials: true });
        onUpdate(req._id, data.request);
        toast.success("Pipeline updated.");
      } catch (err) {
        toast.error(err?.response?.data?.message || "Failed to update.");
      } finally { setSaving(false); }
    },
    [req._id, stage, priority, prefs, onUpdate]
  );

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">Pipeline Stage</label>
        <select
          value={stage}
          onChange={(e) => { setStage(e.target.value); save({ stage: e.target.value }); }}
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white"
        >
          {PIPELINE_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <span className={`inline-block mt-1.5 text-xs px-2 py-0.5 rounded-full font-medium ${STAGE_COLORS[stage]}`}>
          {stage}
        </span>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">Priority</label>
        <select
          value={priority}
          onChange={(e) => { setPriority(e.target.value); save({ priority: e.target.value }); }}
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white"
        >
          {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <span className={`inline-block mt-1.5 text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_COLORS[priority]}`}>
          {priority}
        </span>
      </div>

      <div className="pt-1 border-t border-gray-100">
        <p className="text-xs font-semibold text-gray-500 mb-2">Client Preferences</p>
        <div className="space-y-2">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Budget</label>
            <input
              type="text"
              value={prefs.budget}
              onChange={e => setPrefs(p => ({ ...p, budget: e.target.value }))}
              onBlur={() => save({ prefs })}
              placeholder="e.g. $50,000–80,000"
              className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Preferred Location</label>
            <input
              type="text"
              value={prefs.location}
              onChange={e => setPrefs(p => ({ ...p, location: e.target.value }))}
              onBlur={() => save({ prefs })}
              placeholder="e.g. Downtown, Block C"
              className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
          </div>
        </div>
        {saving && (
          <p className="text-xs text-gray-400 flex items-center gap-1 mt-2">
            <Loader2 size={10} className="animate-spin" /> Saving…
          </p>
        )}
      </div>
    </div>
  );
};

// ── Expanded Lead Panel ────────────────────────────────────────────────────────
const ExpandedPanel = ({ req, onStatusChange, onUpdate, onDelegate }) => {
  const [timelineKey, setTimelineKey] = useState(0);
  const refreshTimeline = () => setTimelineKey(k => k + 1);

  return (
    <tr>
      <td colSpan={8} className="px-0 py-0">
        <div className="bg-gray-50 border-t border-b border-gray-200 px-5 py-5">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* ── Left: Pipeline & Preferences ── */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                <AlertCircle size={12} className="text-brand-500" /> Lead Details
              </h3>
              <PipelineColumn req={req} onUpdate={onUpdate} />
            </div>

            {/* ── Middle: Activity Timeline ── */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                <Clock size={12} className="text-brand-500" /> Activity Timeline
              </h3>
              <ActivityTimeline leadId={req._id} refreshKey={timelineKey} />
            </div>

            {/* ── Right: New Interaction Form ── */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                <Send size={12} className="text-brand-500" /> Log Interaction
              </h3>
              <InteractionForm leadId={req._id} leadUser={req.user} onSuccess={refreshTimeline} />
            </div>
          </div>
          {/* Bottom actions row */}
          <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-gray-500">Accept as Customer</span>
              <StatusToggle
                req={req}
                statusKey="conversionStatus"
                endpoint={`/api/requests/${req._id}/request-conversion`}
                onStatusChange={onStatusChange}
                approvedLabel="Converted"
                approvedColor="emerald"
              />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-gray-500">Accept as Seller</span>
              <StatusToggle
                req={req}
                statusKey="sellerConversionStatus"
                endpoint={`/api/requests/${req._id}/request-seller-conversion`}
                onStatusChange={onStatusChange}
                approvedLabel="Seller"
                approvedColor="brand"
              />
            </div>
            {/* Delegate button */}
            <button
              onClick={onDelegate}
              className="ml-auto flex items-center gap-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3 py-1.5 rounded-lg transition-colors"
            >
              <GitBranch size={12} /> Delegate Lead
            </button>
          </div>
        </div>
      </td>
    </tr>
  );
};

// ── Table Row ─────────────────────────────────────────────────────────────────
const AssignedRow = ({ req, expanded, onToggle, onStatusChange, onUpdate, onDelegate }) => {
  const { property, user } = req;
  const newToday = isToday(req.assignedAt);
  const stage = req.pipelineStage || "New";
  const priority = req.priority || "Warm";

  return (
    <>
      <tr
        onClick={onToggle}
        className={`cursor-pointer border-b transition-colors ${expanded ? "bg-brand-50 border-brand-200" : "hover:bg-gray-50/70 border-gray-100"
          } last:border-b-0`}
      >
        {/* Property */}
        <td className="px-5 py-4">
          <div className="flex items-center gap-3">
            {property?.mainImage ? (
              <img src={property.mainImage} alt={property.name}
                className="w-11 h-11 rounded-xl object-cover flex-shrink-0 border border-gray-200" />
            ) : (
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-500 to-brand-800 flex items-center justify-center flex-shrink-0">
                <Building2 size={18} className="text-white/60" />
              </div>
            )}
            <div className="min-w-0">
              <p className="font-semibold text-gray-800 text-sm truncate max-w-[130px]">{property?.name || "—"}</p>
              <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                <MapPin size={10} className="text-brand-400" />
                <span className="truncate max-w-[110px]">{property?.address || "—"}</span>
              </p>
            </div>
          </div>
        </td>

        {/* User */}
        <td className="px-5 py-4">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-xs flex-shrink-0">
              {user?.name?.[0]?.toUpperCase() ?? "?"}
            </div>
            <div>
              <span className="text-sm font-semibold text-gray-800">{user?.name || "—"}</span>
              {newToday && (
                <span className="ml-2 inline-flex items-center gap-1 bg-green-500 animate-pulse text-white text-xs px-2 py-0.5 rounded-full font-semibold whitespace-nowrap">
                  NEW
                </span>
              )}
            </div>
          </div>
        </td>

        {/* Contact */}
        <td className="px-5 py-4">
          <div className="space-y-1">
            {user?.email && (
              <a href={`mailto:${user.email}`} onClick={e => e.stopPropagation()}
                className="flex items-center gap-1 text-xs text-brand-600 hover:text-brand-800 font-medium">
                <Mail size={11} />{user.email}
              </a>
            )}
            {user?.phone && (
              <a href={`tel:${user.phone}`} onClick={e => e.stopPropagation()}
                className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-800 font-semibold">
                <Phone size={11} />{user.phone}
              </a>
            )}
          </div>
        </td>

        {/* Stage */}
        <td className="px-5 py-4">
          <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${STAGE_COLORS[stage]}`}>
            {stage}
          </span>
        </td>

        {/* Priority */}
        <td className="px-5 py-4">
          <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${PRIORITY_COLORS[priority]}`}>
            {priority}
          </span>
        </td>

        {/* Assigned On */}
        <td className="px-5 py-4 text-xs text-gray-400 whitespace-nowrap">
          {formatDate(req.assignedAt)}
        </td>

        {/* Last Interaction */}
        <td className="px-5 py-4 text-xs text-gray-400 whitespace-nowrap">
          {formatDate(req.lastInteractionDate)}
        </td>

        {/* Expand toggle */}
        <td className="px-4 py-4 text-right">
          <button
            onClick={onToggle}
            className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${expanded ? "bg-brand-100 text-brand-600" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </td>
      </tr>

      {expanded && (
        <ExpandedPanel req={req} onStatusChange={onStatusChange} onUpdate={onUpdate} onDelegate={onDelegate} />
      )}
    </>
  );
};

// ── Follow-up Task Card ───────────────────────────────────────────────────────
const FollowUpTaskCard = ({ task, isOverdue, onUpdateStatus, onExpandLead }) => {
  const leadUser = task.leadId?.user;
  const date = task.nextMeetingDate ? new Date(task.nextMeetingDate) : null;
  const [updating, setUpdating] = useState(false);

  const handleAction = async (status) => {
    setUpdating(true);
    try { await onUpdateStatus(task._id, status); }
    finally { setUpdating(false); }
  };

  return (
    <div className={`rounded-xl border p-3.5 transition-all ${
      isOverdue ? "bg-red-50 border-red-200" : "bg-emerald-50 border-emerald-200"
    }`}>
      {/* Top row */}
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
          isOverdue ? "bg-red-100" : "bg-emerald-100"
        }`}>
          {isOverdue
            ? <AlertCircle size={16} className="text-red-500" />
            : <Calendar size={16} className="text-emerald-600" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            {/* Clickable name → expands matching lead row */}
            <button
              onClick={() => onExpandLead(task.leadId?._id)}
              className={`font-semibold text-sm text-left truncate hover:underline ${
                isOverdue ? "text-red-700" : "text-emerald-800"
              }`}
            >
              {leadUser?.name || "Unknown Lead"}
            </button>
            {task.followUpStatus === "Unable to Contact" && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-orange-100 text-orange-600 flex-shrink-0">
                Try again later
              </span>
            )}
          </div>
          {task.nextMeetingAgenda && (
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{task.nextMeetingAgenda}</p>
          )}
          {date && (
            <p className={`text-xs font-medium mt-1 flex items-center gap-1 ${
              isOverdue ? "text-red-500" : "text-emerald-600"
            }`}>
              <Clock size={10} />
              {date.toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
              {" · "}
              {date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
            </p>
          )}
        </div>
      </div>
      {/* Action Buttons */}
      <div className="flex items-center gap-2 mt-2.5 ml-11">
        <button
          onClick={() => handleAction("Completed")}
          disabled={updating}
          className="flex items-center gap-1 px-3 py-1.5 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
        >
          {updating ? <Loader2 size={12} className="animate-spin" /> : <CheckCheck size={12} />}
          Complete
        </button>
        <button
          onClick={() => handleAction("Unable to Contact")}
          disabled={updating || task.followUpStatus === "Unable to Contact"}
          className="flex items-center gap-1 px-3 py-1.5 bg-orange-100 text-orange-700 hover:bg-orange-200 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
        >
          {updating ? <Loader2 size={12} className="animate-spin" /> : <AlertCircle size={12} />}
          Unable to contact
        </button>
      </div>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
const AssignedLeads = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [delegateTarget, setDelegateTarget] = useState(null);
  const [todayTasks, setTodayTasks] = useState([]);
  const [previousTasks, setPreviousTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [leadsRes, tasksRes] = await Promise.all([
          axios.get("/api/requests/assigned", { withCredentials: true }),
          axios.get("/api/seller/tasks", { withCredentials: true }),
        ]);
        setRequests(leadsRes.data.requests || []);
        setTodayTasks(tasksRes.data.todayTasks || []);
        setPreviousTasks(tasksRes.data.previousTasks || []);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load data.");
      } finally {
        setLoading(false);
        setTasksLoading(false);
      }
    };
    fetchAll();
  }, []);

  const handleUpdateTaskStatus = async (interactionId, newStatus) => {
    try {
      await axios.put(
        `/api/interactions/${interactionId}/followup-status`,
        { status: newStatus },
        { withCredentials: true }
      );
      if (newStatus === "Completed") {
        setTodayTasks(prev => prev.filter(t => t._id !== interactionId));
        setPreviousTasks(prev => prev.filter(t => t._id !== interactionId));
      } else {
        const mark = (list) => list.map(t =>
          t._id === interactionId ? { ...t, followUpStatus: newStatus } : t
        );
        setTodayTasks(prev => mark(prev));
        setPreviousTasks(prev => mark(prev));
      }
    } catch (err) {
      toast.error("Failed to update task status.");
    }
  };

  // Bonus UX: clicking a task card name auto-expands the matching lead row
  const handleExpandByLeadId = (leadId) => {
    if (!leadId) return;
    setExpandedId(prev => (prev === leadId ? null : leadId));
    // Scroll to table smoothly
    setTimeout(() => {
      document.getElementById(`lead-row-${leadId}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  };

  const hasTasks = todayTasks.length > 0 || previousTasks.length > 0;

  const handleStatusChange = (requestId, newStatus, statusKey) => {
    setRequests(prev =>
      prev.map(r => (r._id === requestId ? { ...r, [statusKey]: newStatus } : r))
    );
  };

  const handleUpdate = (requestId, updatedReq) => {
    setRequests(prev =>
      prev.map(r => (r._id === requestId ? { ...r, ...updatedReq } : r))
    );
  };

  const handleToggle = (id) => setExpandedId(prev => (prev === id ? null : id));
  const handleDelegate = (lead) => { setDelegateTarget(lead); };
  const handleDelegated = (leadId) => {
    setRequests(prev => prev.filter(r => r._id !== leadId));
    setExpandedId(null);
  };
  const todayCount = requests.filter(r => isToday(r.assignedAt)).length;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">My Assigned Leads</h1>
        {!loading && todayCount > 0 && (
          <div className="mt-3 inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm font-semibold px-4 py-2 rounded-xl">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            {todayCount} new lead{todayCount > 1 ? "s" : ""} assigned today!
          </div>
        )}
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>
      )}

      {/* ── Follow-up Tasks Section ── */}
      {!tasksLoading && hasTasks && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Calendar size={14} className="text-brand-500" />
            Follow-up Tasks
          </h2>

          {previousTasks.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-semibold text-red-500 uppercase tracking-wider mb-2">
                ⚠️ PREVIOUS TASKS — OVERDUE ({previousTasks.length})
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
                {previousTasks.map(t => (
                  <FollowUpTaskCard
                    key={t._id}
                    task={t}
                    isOverdue={true}
                    onUpdateStatus={handleUpdateTaskStatus}
                    onExpandLead={handleExpandByLeadId}
                  />
                ))}
              </div>
            </div>
          )}

          {todayTasks.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-2">
                📅 TODAY'S FOLLOW-UPS ({todayTasks.length})
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
                {todayTasks.map(t => (
                  <FollowUpTaskCard
                    key={t._id}
                    task={t}
                    isOverdue={false}
                    onUpdateStatus={handleUpdateTaskStatus}
                    onExpandLead={handleExpandByLeadId}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tasks loading skeleton */}
      {tasksLoading && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
          <div className="h-4 bg-gray-200 rounded w-36 animate-pulse mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      )}


      {/* Skeleton */}
      {loading && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-50">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4 animate-pulse">
                <div className="w-11 h-11 bg-gray-200 rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 bg-gray-200 rounded w-1/3" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && requests.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <InboxIcon size={56} className="text-gray-200 mb-4" />
          <p className="text-lg font-semibold text-gray-500">No assigned leads yet</p>
          <p className="text-sm text-gray-400 mt-1">The admin will assign leads to you. Check back soon.</p>
        </div>
      )}

      {/* Table */}
      {!loading && requests.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Property</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600">User Name</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Contact</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Stage</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Priority</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600 whitespace-nowrap">Assigned On</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600 whitespace-nowrap">Last Contact</th>
                  <th className="px-4 py-3.5" />
                </tr>
              </thead>
              <tbody>
                {requests.map(req => (
                  <React.Fragment key={req._id}>
                    {/* id anchor for scroll-to from task card click */}
                    <tr id={`lead-row-${req._id}`} style={{ display: "none" }} />
                    <AssignedRow
                      req={req}
                      expanded={expandedId === req._id}
                      onToggle={() => handleToggle(req._id)}
                      onStatusChange={handleStatusChange}
                      onUpdate={handleUpdate}
                      onDelegate={() => handleDelegate(req)}
                    />
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
          <p className="px-5 py-3 text-xs text-gray-400 border-t border-gray-100">
            {requests.length} assigned lead{requests.length !== 1 ? "s" : ""}
          </p>
        </div>
      )}
      {/* Delegation Modal */}
      {delegateTarget && (
        <DelegateModal
          lead={delegateTarget}
          onClose={() => setDelegateTarget(null)}
          onDelegated={handleDelegated}
        />
      )}
    </div>
  );
};

export default AssignedLeads;
