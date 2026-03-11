import React from "react";
import { Eye } from "lucide-react";

const STAGE_COLORS = {
  "New": "bg-gray-100 text-gray-600",
  "Contacted": "bg-blue-100 text-blue-700",
  "Site Visited": "bg-purple-100 text-purple-700",
  "Negotiation": "bg-amber-100 text-amber-700",
  "Closed Won": "bg-emerald-100 text-emerald-700",
  "Closed Lost": "bg-red-100 text-red-500",
};

const SubSellerLeadRow = ({ lead, onViewTimeline }) => {
  const user = lead.user;
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

export default SubSellerLeadRow;
