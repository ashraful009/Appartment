import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  AlertTriangle, Clock, Eye, X,
  PhoneCall, MessageCircle, Users, FileText, StickyNote,
} from "lucide-react";

const formatDateTime = (d) => {
  if (!d) return "—";
  const dt = new Date(d);
  return `${dt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })} · ${dt.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`;
};

const TYPE_ICON = {
  "Call": <PhoneCall size={13} className="text-blue-500" />,
  "WhatsApp": <MessageCircle size={13} className="text-green-500" />,
  "Meeting": <Users size={13} className="text-purple-500" />,
  "Document Sent": <FileText size={13} className="text-orange-500" />,
  "Note": <StickyNote size={13} className="text-gray-400" />,
};

const TYPE_DOT = {
  "Call": "bg-blue-500",
  "WhatsApp": "bg-green-500",
  "Meeting": "bg-purple-500",
  "Document Sent": "bg-orange-500",
  "Note": "bg-gray-400",
};

const TimelineModal = ({ leadId, leadName, onClose }) => {
  const [interactions, setInteractions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`/api/interactions/${leadId}`, { withCredentials: true })
      .then(({ data }) => setInteractions(data.interactions))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [leadId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Read-Only Timeline</p>
            <h3 className="text-base font-extrabold text-gray-800">{leadName}</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <X size={16} className="text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="w-3 h-3 bg-gray-200 rounded-full mt-1.5 flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 bg-gray-200 rounded w-28" />
                    <div className="h-3 bg-gray-100 rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : interactions.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Eye size={36} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">No interactions logged yet.</p>
            </div>
          ) : (
            <div className="relative">
              <div className="absolute left-1.5 top-2 bottom-0 w-px bg-gray-200" />
              <div className="space-y-5">
                {interactions.map(item => (
                  <div
                    key={item._id}
                    className={`flex gap-4 relative ${
                      item.isMentorRequested
                        ? "bg-red-50 border border-red-300 rounded-xl p-3 -ml-2"
                        : ""
                    }`}
                  >
                    <div className={`w-3 h-3 rounded-full flex-shrink-0 mt-1.5 border-2 border-white ring-1 ring-gray-200 ${TYPE_DOT[item.interactionType] || "bg-gray-300"}`} />
                    <div className="flex-1 pb-2">
                      {item.isMentorRequested && (
                        <div className="flex items-center gap-1.5 mb-1.5 text-red-600 font-semibold text-xs">
                          <AlertTriangle size={12} /> Mentor Help Requested
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
                        <div className="mt-2 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
                          <p className="text-xs font-semibold text-yellow-700 mb-0.5 uppercase tracking-wide">Admin Note</p>
                          <p className="text-xs text-yellow-800">{item.adminNote}</p>
                        </div>
                      )}
                      {item.nextMeetingDate && (
                        <div className="mt-2 inline-flex items-center gap-1.5 text-xs bg-purple-50 text-purple-600 border border-purple-200 px-2 py-1 rounded-lg">
                          <Clock size={11} />
                          Follow-up: {formatDateTime(item.nextMeetingDate)}
                          {item.nextMeetingAgenda && ` · ${item.nextMeetingAgenda}`}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
          <p className="text-xs text-gray-400 text-center flex items-center justify-center gap-1.5">
            <Eye size={12} /> Read-only mentor view — no changes can be made here.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TimelineModal;
