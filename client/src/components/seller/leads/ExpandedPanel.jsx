import React, { useState } from "react";
import { AlertCircle, Clock, Send, GitBranch, CheckCircle2, Loader2 } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import PipelineColumn from "./PipelineColumn";
import ActivityTimeline from "./ActivityTimeline";
import InteractionForm from "./InteractionForm";

// ── Status Toggle (used only inside ExpandedPanel) ────────────────────────────
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

// ── Expanded Panel ────────────────────────────────────────────────────────────
const ExpandedPanel = ({ req, onStatusChange, onUpdate, onDelegate }) => {
  const [timelineKey, setTimelineKey] = useState(0);
  const refreshTimeline = () => setTimelineKey(k => k + 1);

  return (
    <tr>
      <td colSpan={8} className="px-0 py-0">
        <div className="bg-gray-50 border-t border-b border-gray-200 px-5 py-5">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Pipeline & Preferences */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                <AlertCircle size={12} className="text-brand-500" /> Lead Details
              </h3>
              <PipelineColumn req={req} onUpdate={onUpdate} />
            </div>

            {/* Middle: Activity Timeline */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                <Clock size={12} className="text-brand-500" /> Activity Timeline
              </h3>
              <ActivityTimeline leadId={req._id} refreshKey={timelineKey} />
            </div>

            {/* Right: New Interaction Form */}
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

export default ExpandedPanel;
