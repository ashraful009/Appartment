import React from "react";
import { Phone, Mail, User } from "lucide-react";
import InquiryStepper from "./InquiryStepper";

// Priority badge colours
const PRIORITY_STYLE = {
  Hot:  "bg-red-100 text-red-700 border-red-200",
  Warm: "bg-amber-100 text-amber-700 border-amber-200",
  Cold: "bg-sky-100 text-sky-700 border-sky-200",
};

// Status badge colours
const STATUS_STYLE = {
  pending:  "bg-yellow-100 text-yellow-700",
  assigned: "bg-emerald-100 text-emerald-700",
};

const FALLBACK_IMG = "https://placehold.co/120x90/e2e8f0/94a3b8?text=No+Image";

/**
 * InquiryCard — displays a single property inquiry with pipeline stepper.
 * Props: inquiry {object}  — populated PriceRequest document
 */
const InquiryCard = ({ inquiry }) => {
  const property = inquiry?.property;
  const agent    = inquiry?.assignedTo;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-5">
      <div className="flex flex-col sm:flex-row gap-4">

        {/* ── Property Image ───────────────────────────────────────── */}
        <div className="flex-shrink-0">
          <img
            src={property?.mainImage || FALLBACK_IMG}
            alt={property?.name || "Property"}
            className="w-full sm:w-28 h-24 object-cover rounded-xl"
            onError={(e) => { e.target.src = FALLBACK_IMG; }}
          />
        </div>

        {/* ── Body ─────────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
            <div>
              <h3 className="text-base font-bold text-gray-900 truncate">
                {property?.name ?? "Unknown Property"}
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">{property?.address ?? ""}</p>
            </div>

            {/* Badges */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${PRIORITY_STYLE[inquiry.priority] ?? ""}`}>
                {inquiry.priority}
              </span>
              <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${STATUS_STYLE[inquiry.status] ?? "bg-gray-100 text-gray-500"}`}>
                {inquiry.status === "pending" ? "Pending Assignment" : "Assigned"}
              </span>
            </div>
          </div>

          {/* ── Assigned Agent box ─────────────────────────────────── */}
          {agent ? (
            <div className="mt-2 flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2">
              {agent.profilePhoto ? (
                <img src={agent.profilePhoto} alt={agent.name} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
                  <User size={14} className="text-brand-600" />
                </div>
              )}
              <div className="min-w-0">
                <p className="text-xs font-semibold text-gray-800 truncate">{agent.name}</p>
                <div className="flex items-center gap-3 mt-0.5">
                  {agent.phone && (
                    <a href={`tel:${agent.phone}`} className="flex items-center gap-1 text-[11px] text-brand-600 hover:underline">
                      <Phone size={10} /> {agent.phone}
                    </a>
                  )}
                  {agent.email && (
                    <a href={`mailto:${agent.email}`} className="flex items-center gap-1 text-[11px] text-gray-500 hover:underline">
                      <Mail size={10} /> {agent.email}
                    </a>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-2 text-xs text-gray-400 italic bg-gray-50 rounded-xl px-3 py-2 border border-dashed border-gray-200">
              No agent assigned yet — our team will reach out soon.
            </div>
          )}

          {/* ── Pipeline Stepper ───────────────────────────────────── */}
          <InquiryStepper currentStage={inquiry.pipelineStage} />
        </div>
      </div>
    </div>
  );
};

export default InquiryCard;
