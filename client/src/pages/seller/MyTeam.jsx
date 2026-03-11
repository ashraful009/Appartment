import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Users2 } from "lucide-react";
import EarningsCard from "../../components/seller/team/EarningsCard";
import BroadcastCard from "../../components/seller/team/BroadcastCard";
import SubSellerCard from "../../components/seller/team/SubSellerCard";
import TimelineModal from "../../components/seller/team/TimelineModal";

// ── Main ──────────────────────────────────────────────────────────────────────
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
