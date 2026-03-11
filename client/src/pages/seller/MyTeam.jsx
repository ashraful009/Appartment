import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Users2, TrendingUp, Phone, DollarSign, Send, ChevronDown, ChevronUp,
  Loader2, AlertTriangle, MessageCircle, PhoneCall, Users, FileText,
  StickyNote, X, Clock, Eye,
} from "lucide-react";

// ── Helpers ───────────────────────────────────────────────────────────────────
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

// ── Earnings Card ─────────────────────────────────────────────────────────────
const EarningsCard = ({ totalEarnings, totalConversions, memberCount }) => (
  <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 shadow-lg relative overflow-hidden flex-1 min-w-0">
    <div className="absolute -right-8 -bottom-8 w-40 h-40 rounded-full bg-amber-500/10" />
    <div className="absolute -left-4 -top-8 w-28 h-28 rounded-full bg-amber-500/5" />
    <div className="relative">
      <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Total Team Earnings</p>
      <p className="text-4xl font-extrabold text-amber-400 mb-2">
        ৳{totalEarnings.toLocaleString()}
      </p>
      <div className="flex items-center gap-4 mt-3">
        <div className="text-center">
          <p className="text-2xl font-bold text-white">{memberCount}</p>
          <p className="text-xs text-gray-400">Members</p>
        </div>
        <div className="w-px h-8 bg-gray-700" />
        <div className="text-center">
          <p className="text-2xl font-bold text-emerald-400">{totalConversions}</p>
          <p className="text-xs text-gray-400">Conversions</p>
        </div>
        <div className="w-px h-8 bg-gray-700" />
        <div className="text-center">
          <p className="text-2xl font-bold text-amber-300">৳5,000</p>
          <p className="text-xs text-gray-400">/ Conversion</p>
        </div>
      </div>
    </div>
  </div>
);

// ── Broadcast Card ────────────────────────────────────────────────────────────
const BroadcastCard = ({ memberCount }) => {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleBroadcast = async () => {
    if (!message.trim()) { toast.error("Please enter a message."); return; }
    setSending(true);
    try {
      const { data } = await axios.post("/api/seller/broadcast", { message }, { withCredentials: true });
      toast.success(data.message || "Broadcast sent!");
      setMessage("");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to send broadcast.");
    } finally { setSending(false); }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex-1 min-w-0">
      <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Team Broadcast</p>
      <p className="text-sm text-gray-500 mb-4">Send a message to all {memberCount} sub-seller(s).</p>
      <textarea
        rows={3}
        value={message}
        onChange={e => setMessage(e.target.value)}
        placeholder="Type your message here…"
        className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none mb-3"
      />
      <button
        onClick={handleBroadcast}
        disabled={sending || !message.trim()}
        className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-semibold text-sm py-2.5 rounded-xl transition-colors"
      >
        {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
        {sending ? "Sending…" : "Send to All"}
      </button>
    </div>
  );
};

// ── Read-only Timeline Modal ──────────────────────────────────────────────────
const TimelineModal = ({ leadId, leadName, onClose }) => {
  const [interactions, setInteractions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Parent seller reads via the admin-style endpoint (no ownership check needed)
    // We reuse the mentorship oversight fetch — the same /api/interactions/:leadId
    // but we pass the sub-seller's perspective. Since this is a parent read, we call
    // the standard endpoint (the parent already has sub-seller context from team-overview).
    axios.get(`/api/interactions/${leadId}`, { withCredentials: true })
      .then(({ data }) => setInteractions(data.interactions))
      .catch(() => { })
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
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
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
                    className={`flex gap-4 relative ${item.isMentorRequested
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

        {/* Footer — read-only notice */}
        <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
          <p className="text-xs text-gray-400 text-center flex items-center justify-center gap-1.5">
            <Eye size={12} /> Read-only mentor view — no changes can be made here.
          </p>
        </div>
      </div>
    </div>
  );
};

// ── Sub-seller Lead Row ────────────────────────────────────────────────────────
const SubSellerLeadRow = ({ lead, onViewTimeline }) => {
  const user = lead.user;
  const STAGE_COLORS = {
    "New": "bg-gray-100 text-gray-600", "Contacted": "bg-blue-100 text-blue-700",
    "Site Visited": "bg-purple-100 text-purple-700", "Negotiation": "bg-amber-100 text-amber-700",
    "Closed Won": "bg-emerald-100 text-emerald-700", "Closed Lost": "bg-red-100 text-red-500",
  };

  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-gray-100 last:border-b-0 group">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-700 truncate">
          {user?.name || lead.user?.toString?.() || "Unknown Lead"}
        </p>
        <p className="text-xs text-gray-400 truncate">{user?.phone || ""}</p>
      </div>
      <span className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${STAGE_COLORS[lead.pipelineStage] || STAGE_COLORS["New"]}`}>
        {lead.pipelineStage || "New"}
      </span>
      <button
        onClick={() => onViewTimeline(lead._id, user?.name || "Lead")}
        className="flex-shrink-0 flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-800 bg-brand-50 hover:bg-brand-100 px-2.5 py-1.5 rounded-lg transition-colors"
      >
        <Eye size={11} /> Timeline
      </button>
    </div>
  );
};

// ── Sub-seller Card ────────────────────────────────────────────────────────────
const SubSellerCard = ({ member, onViewTimeline }) => {
  const [expanded, setExpanded] = useState(false);
  const hasLeads = member.leads?.length > 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Card Header */}
      <div
        onClick={() => hasLeads && setExpanded(e => !e)}
        className={`flex items-center gap-4 px-5 py-4 transition-colors ${hasLeads ? "cursor-pointer hover:bg-gray-50" : ""}`}
      >
        <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-sm flex-shrink-0">
          {member.name?.[0]?.toUpperCase() ?? "?"}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-800 text-sm">{member.name}</p>
          {member.phone && (
            <a href={`tel:${member.phone}`} onClick={e => e.stopPropagation()}
              className="flex items-center gap-1 text-xs text-emerald-600 hover:underline mt-0.5">
              <Phone size={11} />{member.phone}
            </a>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="text-center hidden sm:block">
            <p className="text-lg font-extrabold text-gray-800">{member.totalLeads}</p>
            <p className="text-xs text-gray-400">Leads</p>
          </div>
          <div className="text-center hidden sm:block">
            <p className="text-lg font-extrabold text-emerald-600">{member.convertedLeads}</p>
            <p className="text-xs text-gray-400">Converted</p>
          </div>
          {member.convertedLeads > 0 && (
            <div className="text-center hidden sm:block">
              <p className="text-sm font-bold text-amber-600">৳{(member.convertedLeads * 5000).toLocaleString()}</p>
              <p className="text-xs text-gray-400">Earned</p>
            </div>
          )}
          {hasLeads && (
            <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${expanded ? "bg-brand-100 text-brand-600" : "bg-gray-100 text-gray-400"}`}>
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </div>
          )}
        </div>
      </div>

      {/* Expanded Leads */}
      {expanded && hasLeads && (
        <div className="border-t border-gray-100 bg-gray-50 px-5 py-3">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
            {member.leads.length} Lead{member.leads.length !== 1 ? "s" : ""} — Read-only
          </p>
          <div>
            {member.leads.map(lead => (
              <SubSellerLeadRow
                key={lead._id}
                lead={lead}
                onViewTimeline={onViewTimeline}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
const MyTeam = () => {
  const [team, setTeam] = useState([]);
  const [overview, setOverview] = useState({ totalEarnings: 0, totalConversions: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [timelineModal, setTimelineModal] = useState(null); // { leadId, leadName }

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const { data } = await axios.get("/api/seller/team-overview", { withCredentials: true });
        setTeam(data.team);
        setOverview({ totalEarnings: data.totalTeamEarnings, totalConversions: data.totalConversions });
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load team data.");
      } finally { setLoading(false); }
    };
    fetchOverview();
  }, []);

  const openTimeline = useCallback((leadId, leadName) => setTimelineModal({ leadId, leadName }), []);
  const closeTimeline = useCallback(() => setTimelineModal(null), []);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Seller Panel</p>
        <h1 className="text-3xl font-extrabold text-gray-900">Team Hub</h1>
        <p className="text-gray-500 text-sm mt-1">
          Manage your sub-sellers, track team earnings, and broadcast updates.
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>
      )}

      {/* Top Stats + Broadcast Row */}
      {!loading && (
        <div className="flex flex-col lg:flex-row gap-5 mb-8">
          <EarningsCard
            totalEarnings={overview.totalEarnings}
            totalConversions={overview.totalConversions}
            memberCount={team.length}
          />
          <BroadcastCard memberCount={team.length} />
        </div>
      )}

      {/* Loading skeletons */}
      {loading && (
        <div className="space-y-3 mb-8">
          <div className="flex gap-5">
            <div className="flex-1 h-36 bg-gray-100 rounded-2xl animate-pulse" />
            <div className="flex-1 h-36 bg-gray-100 rounded-2xl animate-pulse" />
          </div>
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 flex gap-4 animate-pulse">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/3" />
                <div className="h-3 bg-gray-100 rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && team.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-brand-100 flex items-center justify-center mb-4">
            <Users2 size={32} className="text-brand-500" />
          </div>
          <p className="text-lg font-semibold text-gray-500">No sub-sellers in your team yet.</p>
          <p className="text-sm text-gray-400 mt-1">
            Share your referral code or request seller conversions to grow your team.
          </p>
        </div>
      )}

      {/* Sub-seller Cards */}
      {!loading && team.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
            {team.length} Sub-seller{team.length !== 1 ? "s" : ""} — click a member to see their leads
          </p>
          {team.map(member => (
            <SubSellerCard key={member._id} member={member} onViewTimeline={openTimeline} />
          ))}
        </div>
      )}

      {/* Read-only Timeline Modal */}
      {timelineModal && (
        <TimelineModal
          leadId={timelineModal.leadId}
          leadName={timelineModal.leadName}
          onClose={closeTimeline}
        />
      )}
    </div>
  );
};

export default MyTeam;
