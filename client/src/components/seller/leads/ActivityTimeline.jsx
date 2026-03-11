import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Phone as PhoneIcon, MessageCircle, Users, FileText, StickyNote,
  Calendar, AlertTriangle, HelpCircle, Loader2,
} from "lucide-react";

const formatDateTime = (d) => {
  if (!d) return "—";
  const dt = new Date(d);
  return `${dt.toLocaleDateString("en-GB", { day: "2-digit", month: "short" })} · ${dt.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`;
};

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

const ActivityTimeline = ({ leadId, refreshKey }) => {
  const [interactions, setInteractions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [askingHelp, setAskingHelp] = useState(null);
  const [helpNote, setHelpNote] = useState("");
  const [helpSending, setHelpSending] = useState(false);

  useEffect(() => {
    if (!leadId) return;
    setLoading(true);
    axios.get(`/api/interactions/${leadId}`, { withCredentials: true })
      .then(({ data }) => setInteractions(data.interactions))
      .catch(() => {})
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
            <div className={`w-3 h-3 rounded-full flex-shrink-0 mt-1.5 border-2 border-white ring-1 ring-gray-200 ${TYPE_DOT[item.interactionType] || "bg-gray-300"}`} />
            <div className="flex-1 pb-4">
              {item.isMentorRequested && (
                <div className="flex items-center gap-1.5 mb-1.5 text-xs font-bold text-red-600 bg-red-50 border border-red-200 rounded-lg px-2 py-1">
                  <AlertTriangle size={11} /> Help Requested — Mentor Notified
                </div>
              )}
              {item.isJointMeeting && (
                <div className="flex items-center gap-1.5 mb-1.5 text-xs font-semibold text-purple-700 bg-purple-50 border border-purple-200 rounded-lg px-2 py-1">
                  <Users size={11} /> Joint Meeting Scheduled
                </div>
              )}
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                  {TYPE_ICON[item.interactionType]}{item.interactionType}
                </span>
                <span className="text-xs text-gray-400">{formatDateTime(item.date)}</span>
                {item.sellerId?.name && (
                  <span className="text-xs text-gray-400 italic">by {item.sellerId.name}</span>
                )}
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">{item.notes}</p>
              {item.adminNote && (
                <div className="mt-2 bg-red-50 border-l-4 border-red-500 border border-red-200 rounded-xl px-3 py-2.5">
                  <p className="text-xs font-extrabold text-red-600 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                    🚨 Admin Instruction
                  </p>
                  <p className="text-sm font-semibold text-red-800 leading-relaxed">{item.adminNote}</p>
                </div>
              )}
              {item.nextMeetingDate && (
                <div className="mt-2 inline-flex items-center gap-1.5 text-xs bg-purple-50 text-purple-600 border border-purple-200 px-2 py-1 rounded-lg">
                  <Calendar size={11} />
                  Follow-up: {formatDateTime(item.nextMeetingDate)}
                  {item.nextMeetingAgenda && ` · ${item.nextMeetingAgenda}`}
                </div>
              )}
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

export default ActivityTimeline;
