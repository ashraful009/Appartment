import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  X, Clock, PhoneCall, MessageCircle, Users, FileText, StickyNote,
  Loader2, Eye, CheckCheck, AlertTriangle, Shield, Plus,
} from "lucide-react";

const formatDateTime = (d) => {
  if (!d) return "—";
  const dt = new Date(d);
  return `${dt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })} · ${dt.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`;
};

const TYPE_ICON = {
  "Call":          <PhoneCall size={12} className="text-blue-500" />,
  "WhatsApp":      <MessageCircle size={12} className="text-green-500" />,
  "Meeting":       <Users size={12} className="text-purple-500" />,
  "Document Sent": <FileText size={12} className="text-orange-500" />,
  "Note":          <StickyNote size={12} className="text-gray-400" />,
};
const TYPE_DOT = {
  "Call": "bg-blue-500", "WhatsApp": "bg-green-500", "Meeting": "bg-purple-500",
  "Document Sent": "bg-orange-500", "Note": "bg-gray-400",
};

// ── Inline Admin Directive Input ──────────────────────────────────────────────
const DirectiveInput = ({ interactionId, onSaved }) => {
  const [text, setText]     = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!text.trim()) { toast.error("Directive cannot be empty."); return; }
    setSaving(true);
    try {
      await axios.put(`/api/interactions/${interactionId}/admin-note`, { adminNote: text.trim() }, { withCredentials: true });
      toast.success("Directive saved!");
      onSaved(interactionId, text.trim());
      setText("");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save directive.");
    } finally { setSaving(false); }
  };

  return (
    <div className="mt-2 bg-amber-50 border border-amber-200 rounded-xl p-3 space-y-2">
      <p className="text-xs font-bold text-amber-700 flex items-center gap-1.5"><Shield size={12} /> Add Admin Directive</p>
      <textarea rows={2} value={text} onChange={e => setText(e.target.value)}
        placeholder="Leave an actionable directive for this seller…"
        className="w-full text-xs border border-amber-200 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-1 focus:ring-amber-400 resize-none bg-white" />
      <div className="flex gap-2">
        <button onClick={() => onSaved(interactionId, null)} className="flex-1 text-xs py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50">Cancel</button>
        <button onClick={handleSave} disabled={saving || !text.trim()}
          className="flex-1 flex items-center justify-center gap-1 text-xs py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white font-semibold">
          {saving ? <Loader2 size={11} className="animate-spin" /> : <CheckCheck size={11} />}
          {saving ? "Saving…" : "Save Directive"}
        </button>
      </div>
    </div>
  );
};

// ── Timeline Entry ────────────────────────────────────────────────────────────
const TimelineEntry = ({ item }) => {
  const [showDirectiveInput, setShowDirectiveInput] = useState(false);
  const [adminNote, setAdminNote] = useState(item.adminNote || "");

  const handleSaved = (id, savedNote) => {
    if (savedNote !== null) setAdminNote(savedNote);
    setShowDirectiveInput(false);
  };

  return (
    <div className="flex gap-4 relative">
      <div className={`w-3 h-3 rounded-full flex-shrink-0 mt-1.5 border-2 border-white ring-1 ring-gray-200 ${TYPE_DOT[item.interactionType] || "bg-gray-300"}`} />
      <div className="flex-1 pb-5">
        {item.isMentorRequested && (
          <div className="flex items-center gap-1.5 mb-1.5 text-xs font-bold text-red-600 bg-red-50 border border-red-200 rounded-lg px-2 py-1">
            <AlertTriangle size={11} /> Sub-seller requested mentor help
          </div>
        )}
        {item.isJointMeeting && (
          <div className="flex items-center gap-1.5 mb-1.5 text-xs font-semibold text-purple-700 bg-purple-50 border border-purple-200 rounded-lg px-2 py-1">
            <Users size={11} /> Joint Meeting Requested
          </div>
        )}
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
            {TYPE_ICON[item.interactionType]} {item.interactionType}
          </span>
          <span className="text-xs text-gray-400">{formatDateTime(item.date)}</span>
          {item.sellerId?.name && <span className="text-xs text-gray-400 italic">by {item.sellerId.name}</span>}
        </div>
        <p className="text-sm text-gray-700 leading-relaxed">{item.notes}</p>
        {adminNote && (
          <div className="mt-2 bg-amber-50 border border-amber-300 rounded-xl px-3 py-2.5">
            <p className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-1 flex items-center gap-1"><Shield size={11} /> Admin Directive</p>
            <p className="text-sm font-semibold text-amber-900 leading-relaxed">{adminNote}</p>
          </div>
        )}
        {item.nextMeetingDate && (
          <div className="mt-2 inline-flex items-center gap-1.5 text-xs bg-purple-50 text-purple-600 border border-purple-200 px-2 py-1 rounded-lg">
            <Clock size={11} /> Follow-up: {formatDateTime(item.nextMeetingDate)}
            {item.nextMeetingAgenda && ` · ${item.nextMeetingAgenda}`}
          </div>
        )}
        {showDirectiveInput ? (
          <DirectiveInput interactionId={item._id} onSaved={handleSaved} />
        ) : (
          <button onClick={() => setShowDirectiveInput(true)}
            className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-amber-600 hover:text-amber-800 hover:bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg transition-colors">
            <Plus size={11} /> {adminNote ? "Edit Directive" : "Add Admin Directive"}
          </button>
        )}
      </div>
    </div>
  );
};

// ── Main Modal ─────────────────────────────────────────────────────────────────
const AdminTimelineViewer = ({ leadId, leadTitle, onClose }) => {
  const [interactions, setInteractions] = useState([]);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    if (!leadId) return;
    setLoading(true);
    axios.get(`/api/interactions/admin/${leadId}`, { withCredentials: true })
      .then(({ data }) => setInteractions(data.interactions))
      .catch(() => setInteractions([]))
      .finally(() => setLoading(false));
  }, [leadId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50 rounded-t-2xl">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-0.5">360° Admin Monitor</p>
            <h3 className="text-base font-extrabold text-gray-800">{leadTitle}</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors">
            <X size={16} className="text-gray-500" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {loading ? (
            <div className="space-y-5">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="w-3 h-3 bg-gray-200 rounded-full mt-1.5 flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-28" />
                    <div className="h-3 bg-gray-100 rounded w-full" />
                    <div className="h-3 bg-gray-100 rounded w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : interactions.length === 0 ? (
            <div className="text-center py-14 text-gray-400">
              <Eye size={36} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">No interactions logged for this lead yet.</p>
            </div>
          ) : (
            <div className="relative">
              <div className="absolute left-1.5 top-2 bottom-0 w-px bg-gray-200" />
              <div className="space-y-2">
                {interactions.map(item => <TimelineEntry key={item._id} item={item} />)}
              </div>
            </div>
          )}
        </div>
        <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
          <p className="text-xs text-center text-gray-400 flex items-center justify-center gap-1.5">
            <Shield size={11} /> Admin view — directives are visible to assigned sellers in real-time.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminTimelineViewer;
