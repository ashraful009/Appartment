import React from "react";

/**
 * Toggle — a single animated role toggle switch.
 * Props: isOn, isLoading, isDisabled, trackOn, trackOff, label, onClick
 */
const Toggle = ({ isOn, isLoading, isDisabled, trackOn, trackOff, label, onClick }) => {
  const active = isOn;
  const locked = isDisabled || isLoading;

  return (
    <div className="flex flex-col items-center gap-1 min-w-[52px]">
      <button
        type="button"
        onClick={locked ? undefined : onClick}
        aria-label={`${label} – ${active ? "on" : "off"}`}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200
          focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1
          ${locked ? "cursor-not-allowed opacity-60" : "cursor-pointer"}
          ${active ? trackOn : trackOff}`}
      >
        {isLoading ? (
          <span className="absolute inset-0 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-white animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          </span>
        ) : (
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${active ? "translate-x-6" : "translate-x-1"}`} />
        )}
      </button>
      <span className={`text-[10px] font-semibold uppercase tracking-wide leading-none ${active ? "text-gray-700" : "text-gray-400"}`}>
        {label}
      </span>
    </div>
  );
};

export default Toggle;
