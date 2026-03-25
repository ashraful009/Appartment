import React from "react";
import { CheckCircle2, Circle } from "lucide-react";

// Pipeline stages in display order
const STAGES = [
  { key: "New",         label: "New Request" },
  { key: "Contacted",   label: "Contacted" },
  { key: "Site Visited",label: "Site Visit" },
  { key: "Negotiation", label: "Negotiation" },
  { key: "Closed Won",  label: "Closed Won" },
  { key: "Closed Lost", label: "Closed Lost" },
];

/**
 * InquiryStepper — horizontal visual pipeline progress bar.
 * Props: currentStage {string}  — matches PriceRequest.pipelineStage enum values
 */
const InquiryStepper = ({ currentStage }) => {
  // "Closed Lost" is a terminal failure state; treat it separately
  const isClosedLost = currentStage === "Closed Lost";

  // Index of the current stage (skip Closed Lost from the main flow)
  const mainStages = STAGES.filter((s) => s.key !== "Closed Lost");
  const currentIdx = mainStages.findIndex((s) => s.key === currentStage);

  return (
    <div className="mt-4">
      <div className="flex items-center gap-0">
        {mainStages.map((stage, idx) => {
          const isDone    = !isClosedLost && idx < currentIdx;
          const isActive  = !isClosedLost && idx === currentIdx;
          const isFuture  = isClosedLost || idx > currentIdx;

          return (
            <React.Fragment key={stage.key}>
              {/* Step dot */}
              <div className="flex flex-col items-center flex-shrink-0">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors
                    ${isDone   ? "bg-emerald-500 text-white"
                    : isActive ? "bg-brand-600 text-white ring-4 ring-brand-100"
                    : "bg-gray-200 text-gray-400"}`}
                >
                  {isDone
                    ? <CheckCircle2 size={16} />
                    : <Circle size={16} className={isActive ? "fill-white" : ""} />}
                </div>
                <span
                  className={`mt-1.5 text-[10px] font-semibold text-center leading-tight max-w-[60px]
                    ${isDone   ? "text-emerald-600"
                    : isActive ? "text-brand-700"
                    : "text-gray-400"}`}
                >
                  {stage.label}
                </span>
              </div>

              {/* Connector line between dots */}
              {idx < mainStages.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-1 rounded-full transition-colors
                    ${isDone ? "bg-emerald-400" : "bg-gray-200"}`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Closed Lost badge */}
      {isClosedLost && (
        <div className="mt-3 inline-flex items-center gap-1.5 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold px-3 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
          Closed Lost
        </div>
      )}
    </div>
  );
};

export default InquiryStepper;
