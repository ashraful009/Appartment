import React from "react";
import {
  MapPin, Mail, Phone, Building2,
  ChevronDown, ChevronUp,
} from "lucide-react";
import ExpandedPanel from "./ExpandedPanel";

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

const AssignedRow = ({ req, expanded, onToggle, onStatusChange, onUpdate, onDelegate }) => {
  const { property, user } = req;
  const newToday = isToday(req.assignedAt);
  const stage = req.pipelineStage || "New";
  const priority = req.priority || "Warm";

  return (
    <>
      <tr
        onClick={onToggle}
        className={`cursor-pointer border-b transition-colors ${
          expanded ? "bg-brand-50 border-brand-200" : "hover:bg-gray-50/70 border-gray-100"
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
          <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${STAGE_COLORS[stage]}`}>{stage}</span>
        </td>

        {/* Priority */}
        <td className="px-5 py-4">
          <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${PRIORITY_COLORS[priority]}`}>{priority}</span>
        </td>

        {/* Assigned On */}
        <td className="px-5 py-4 text-xs text-gray-400 whitespace-nowrap">{formatDate(req.assignedAt)}</td>

        {/* Last Interaction */}
        <td className="px-5 py-4 text-xs text-gray-400 whitespace-nowrap">{formatDate(req.lastInteractionDate)}</td>

        {/* Expand toggle */}
        <td className="px-4 py-4 text-right">
          <button
            onClick={onToggle}
            className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
              expanded ? "bg-brand-100 text-brand-600" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
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

export default AssignedRow;
