import React, { useEffect, useState } from "react";
import axios from "axios";
import { AlertTriangle, CheckCheck, UserX, Eye } from "lucide-react";

const daysSince = (dateStr) => {
  if (!dateStr) return "∞";
  const diff = Date.now() - new Date(dateStr).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
};

/**
 * IdleLeadsWidget — fetches and displays leads with no interaction in 7+ days.
 * Props: onViewTimeline(leadId, leadName) => void
 */
const IdleLeadsWidget = ({ onViewTimeline }) => {
  const [idleLeads, setIdleLeads] = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    axios.get("/api/admin/idle-leads", { withCredentials: true })
      .then(({ data }) => setIdleLeads(data.idleLeads))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="h-5 bg-gray-200 rounded w-48 mb-4 animate-pulse" />
      <div className="space-y-3">
        {[1, 2, 3].map(i => <div key={i} className="h-10 bg-gray-100 rounded-xl animate-pulse" />)}
      </div>
    </div>
  );

  if (idleLeads.length === 0) return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
        <CheckCheck size={20} className="text-emerald-600" />
      </div>
      <div>
        <p className="font-bold text-gray-800 text-sm">No Idle Leads</p>
        <p className="text-xs text-gray-400">All leads have recent activity. Great job!</p>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl border border-red-200 shadow-sm overflow-hidden">
      {/* Red alert banner */}
      <div className="flex items-center gap-3 px-5 py-3 bg-red-50 border-b border-red-200">
        <AlertTriangle size={16} className="text-red-500 flex-shrink-0 animate-pulse" />
        <div className="flex-1">
          <p className="text-sm font-extrabold text-red-700">Idle Leads — At Risk ({idleLeads.length})</p>
          <p className="text-xs text-red-500">These leads have had no activity in 7+ days.</p>
        </div>
      </div>
      {/* Lead list */}
      <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto">
        {idleLeads.map(lead => {
          const days   = daysSince(lead.lastInteractionDate);
          const seller = lead.assignedTo;
          const client = lead.user;
          return (
            <div key={lead._id} className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50 transition-colors">
              <div className={`flex-shrink-0 text-center w-12 ${days >= 14 ? "text-red-600" : "text-orange-500"}`}>
                <p className="text-xl font-extrabold leading-none">{days}</p>
                <p className="text-[9px] font-semibold uppercase tracking-wide opacity-70">days</p>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{client?.name || "Unknown Client"}</p>
                <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                  <UserX size={11} />
                  <span>Assigned to: <span className="font-medium text-gray-600">{seller?.name || "Unassigned"}</span></span>
                  {seller?.phone && <span>· {seller.phone}</span>}
                </div>
              </div>
              <div className="hidden sm:block text-right flex-shrink-0">
                <p className="text-xs text-gray-400">Last contact</p>
                <p className="text-xs font-medium text-gray-600">
                  {lead.lastInteractionDate
                    ? new Date(lead.lastInteractionDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })
                    : "Never"}
                </p>
              </div>
              <button
                onClick={() => onViewTimeline(lead._id, client?.name || "Lead")}
                className="flex-shrink-0 flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-800 bg-brand-50 hover:bg-brand-100 border border-brand-200 px-2.5 py-1.5 rounded-lg transition-colors"
              >
                <Eye size={11} /> View
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default IdleLeadsWidget;
