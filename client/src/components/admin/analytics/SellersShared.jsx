import React from "react";
import { InboxIcon } from "lucide-react";

// ── RatioBadge ────────────────────────────────────────────────────────────────
/**
 * RatioBadge — coloured pill showing conversion ratio as a percentage.
 * Props: ratio (0–1 float)
 */
export const RatioBadge = ({ ratio }) => {
  const pct   = Math.round((ratio ?? 0) * 100);
  const color  = pct >= 70 ? "emerald" : pct >= 40 ? "amber" : "red";
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-${color}-100 text-${color}-700`}>
      {pct}%
    </span>
  );
};

// ── SectionHeader ─────────────────────────────────────────────────────────────
/**
 * SectionHeader — large icon + heading row for SellersAnalytics sections.
 * Props: icon (Lucide component), title, subtitle, iconBg (tailwind class)
 */
export const SectionHeader = ({ icon: Icon, title, subtitle, iconBg }) => (
  <div className="flex items-center gap-3 mb-5">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
      <Icon size={18} className="text-white" />
    </div>
    <div>
      <h2 className="text-lg font-extrabold text-gray-900">{title}</h2>
      {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
    </div>
  </div>
);

// ── CardHeader ────────────────────────────────────────────────────────────────
/**
 * CardHeader — compact icon + heading for MasterAnalytics cards.
 * Props: icon, iconBg, title, subtitle
 */
export const CardHeader = ({ icon: Icon, iconBg, title, subtitle }) => (
  <div className="flex items-center gap-3 mb-4">
    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
      <Icon size={16} className="text-white" />
    </div>
    <div>
      <h2 className="text-sm font-extrabold text-gray-900 uppercase tracking-wide">{title}</h2>
      {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
    </div>
  </div>
);

// ── SkeletonCard ──────────────────────────────────────────────────────────────
/**
 * SkeletonCard — animated loading placeholder.
 * Props: h (tailwind height class, default "h-64")
 */
export const SkeletonCard = ({ h = "h-64" }) => (
  <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-5 animate-pulse ${h}`}>
    <div className="h-4 bg-gray-200 rounded w-40 mb-4" />
    <div className="h-full bg-gray-100 rounded-xl" />
  </div>
);

// ── Empty ─────────────────────────────────────────────────────────────────────
/**
 * Empty — centered no-data placeholder.
 * Props: label (string)
 */
export const Empty = ({ label }) => (
  <div className="flex flex-col items-center justify-center py-10 text-center">
    <InboxIcon size={32} className="text-gray-200 mb-2" />
    <p className="text-xs text-gray-400">{label}</p>
  </div>
);

// ── ChartTooltip ──────────────────────────────────────────────────────────────
/**
 * ChartTooltip — bar chart tooltip for conversion data.
 */
export const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-900 text-white rounded-xl px-4 py-2.5 shadow-xl text-sm">
      <p className="font-bold mb-1">{label}</p>
      <p className="text-brand-400 font-semibold">{payload[0].value} conversions</p>
    </div>
  );
};

// ── BarTip ────────────────────────────────────────────────────────────────────
/**
 * BarTip — compact bar chart tooltip for MasterAnalytics.
 */
export const BarTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-900 text-white rounded-xl px-3 py-2 shadow-xl text-xs">
      <p className="font-bold mb-0.5">{label}</p>
      <p className="text-indigo-300 font-semibold">{payload[0].value} conversions</p>
    </div>
  );
};
