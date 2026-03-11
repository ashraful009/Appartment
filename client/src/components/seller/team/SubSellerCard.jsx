import React, { useState } from "react";
import { Phone, ChevronDown, ChevronUp } from "lucide-react";
import SubSellerLeadRow from "./SubSellerLeadRow";

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
            <a
              href={`tel:${member.phone}`}
              onClick={e => e.stopPropagation()}
              className="flex items-center gap-1 text-xs text-emerald-600 hover:underline mt-0.5"
            >
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

export default SubSellerCard;
