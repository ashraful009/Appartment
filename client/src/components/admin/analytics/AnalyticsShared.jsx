import React from "react";

/**
 * ChartSkeleton — animated loading placeholder for chart cards.
 */
export const ChartSkeleton = () => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 animate-pulse">
    <div className="h-5 bg-gray-200 rounded w-48 mb-6" />
    <div className="h-64 bg-gray-100 rounded-xl" />
    <div className="flex gap-3 mt-4 justify-center">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-gray-200 rounded-full" />
          <div className="h-3 bg-gray-200 rounded w-14" />
        </div>
      ))}
    </div>
  </div>
);

/**
 * FunnelTip — custom recharts tooltip for funnel charts.
 */
export const FunnelTip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-gray-900 text-white rounded-xl px-4 py-2.5 shadow-xl text-sm">
      <p className="font-bold mb-0.5">{d.stage}</p>
      <p className="text-indigo-300 font-semibold">{d.count} leads</p>
    </div>
  );
};

/**
 * PieTip — custom recharts tooltip for pie charts.
 */
export const PieTip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-gray-900 text-white rounded-xl px-4 py-2.5 shadow-xl text-sm">
      <p className="font-bold mb-0.5">{d.source}</p>
      <p className="font-semibold" style={{ color: payload[0].color }}>
        {d.count} leads ({d.pct}%)
      </p>
    </div>
  );
};

/**
 * TreeNode — recursive genealogy node for the admin org-chart.
 * Props: node (with children[]), depth (starts at 0)
 */
import { useState } from "react";
import { ChevronDown, ChevronRight as ChevronRightIcon } from "lucide-react";

const ROLE_BADGE = {
  admin:    "bg-red-100 text-red-700",
  seller:   "bg-indigo-100 text-indigo-700",
  user:     "bg-gray-100 text-gray-500",
  customer: "bg-emerald-100 text-emerald-700",
};

export const TreeNode = ({ node, depth = 0 }) => {
  const [open, setOpen] = useState(depth < 2);
  const hasChildren = node.children?.length > 0;
  const primaryRole = node.roles?.find(r => r !== "user") ?? node.roles?.[0] ?? "user";

  return (
    <div className={`relative ${depth > 0 ? "ml-6 pl-4 border-l-2 border-dashed border-gray-200" : ""}`}>
      <div className="flex items-center gap-2 mb-1 group">
        {hasChildren ? (
          <button
            onClick={() => setOpen(o => !o)}
            className="w-5 h-5 rounded flex items-center justify-center text-gray-400 hover:bg-gray-100 flex-shrink-0 transition-colors"
          >
            {open ? <ChevronDown size={13} /> : <ChevronRightIcon size={13} />}
          </button>
        ) : (
          <span className="w-5 h-5 flex-shrink-0" />
        )}
        <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold
          bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-sm">
          {node.name?.[0]?.toUpperCase() ?? "?"}
        </div>
        <span className="text-sm font-semibold text-gray-800">{node.name}</span>
        <span className={`text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full ${ROLE_BADGE[primaryRole] ?? "bg-gray-100 text-gray-500"}`}>
          {primaryRole}
        </span>
        {hasChildren && <span className="text-[10px] text-gray-400 font-medium">{node.children.length} direct</span>}
      </div>
      {open && hasChildren && (
        <div className="mt-1 mb-2">
          {node.children.map(child => <TreeNode key={child._id} node={child} depth={depth + 1} />)}
        </div>
      )}
    </div>
  );
};
