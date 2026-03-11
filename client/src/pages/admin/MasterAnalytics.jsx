import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  ResponsiveContainer,
  BarChart, Bar,
  XAxis, YAxis,
  Tooltip, CartesianGrid,
  FunnelChart, Funnel, LabelList, Tooltip as FunnelTooltip,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import {
  TrendingUp, TrendingDown, PieChart as PieIcon,
  InboxIcon, Trophy, Network, Users, ChevronDown,
  ChevronRight as ChevronRightIcon, BarChart2, List, Phone, LayoutDashboard,
} from "lucide-react";

// ── Colour palettes ─────────────────────────────────────────────────────────
const FUNNEL_COLORS = ["#6366f1","#3b82f6","#8b5cf6","#f59e0b","#10b981","#ef4444"];
const SOURCE_COLORS = {
  "Website": "#6366f1", "Facebook": "#3b82f6",
  "Agent Referral": "#f59e0b", "Organic Search": "#10b981", "Other": "#94a3b8",
};
const FALLBACK_COLORS = ["#8b5cf6","#ec4899","#14b8a6","#f97316","#64748b"];
const RANK_STYLE = [
  "bg-amber-400 text-amber-900 ring-2 ring-amber-300",
  "bg-gray-300 text-gray-700 ring-2 ring-gray-200",
  "bg-orange-300 text-orange-800 ring-2 ring-orange-200",
];
const ROW_BORDER = [
  "border-l-4 border-amber-400", "border-l-4 border-gray-400",
  "border-l-4 border-orange-400",
];

// ── Shared mini helpers ──────────────────────────────────────────────────────
const RatioBadge = ({ ratio }) => {
  const pct = Math.round((ratio ?? 0) * 100);
  const color = pct >= 70 ? "emerald" : pct >= 40 ? "amber" : "red";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-${color}-100 text-${color}-700`}>
      {pct}%
    </span>
  );
};

const CardHeader = ({ icon: Icon, iconBg, title, subtitle }) => (
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

const SkeletonCard = ({ h = "h-64" }) => (
  <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-5 animate-pulse ${h}`}>
    <div className="h-4 bg-gray-200 rounded w-40 mb-4" />
    <div className="h-full bg-gray-100 rounded-xl" />
  </div>
);

const Empty = ({ label }) => (
  <div className="flex flex-col items-center justify-center py-10 text-center">
    <InboxIcon size={32} className="text-gray-200 mb-2" />
    <p className="text-xs text-gray-400">{label}</p>
  </div>
);

// ── Custom Tooltips ──────────────────────────────────────────────────────────
const FunnelTip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-gray-900 text-white rounded-xl px-3 py-2 shadow-xl text-xs">
      <p className="font-bold mb-0.5">{d.stage}</p>
      <p className="text-indigo-300 font-semibold">{d.count} leads</p>
    </div>
  );
};

const PieTip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-gray-900 text-white rounded-xl px-3 py-2 shadow-xl text-xs">
      <p className="font-bold mb-0.5">{d.source}</p>
      <p className="font-semibold" style={{ color: payload[0].color }}>{d.count} leads ({d.pct}%)</p>
    </div>
  );
};

const BarTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-900 text-white rounded-xl px-3 py-2 shadow-xl text-xs">
      <p className="font-bold mb-0.5">{label}</p>
      <p className="text-indigo-300 font-semibold">{payload[0].value} conversions</p>
    </div>
  );
};

// ── Genealogy TreeNode ───────────────────────────────────────────────────────
const ROLE_BADGE = {
  admin: "bg-red-100 text-red-700", seller: "bg-indigo-100 text-indigo-700",
  user: "bg-gray-100 text-gray-500", customer: "bg-emerald-100 text-emerald-700",
};
const TreeNode = ({ node, depth = 0 }) => {
  const [open, setOpen] = useState(depth < 2);
  const hasChildren = node.children?.length > 0;
  const primaryRole = node.roles?.find(r => r !== "user") ?? node.roles?.[0] ?? "user";
  return (
    <div className={`relative ${depth > 0 ? "ml-6 pl-4 border-l-2 border-dashed border-gray-200" : ""}`}>
      <div className="flex items-center gap-2 mb-1">
        {hasChildren ? (
          <button onClick={() => setOpen(o => !o)}
            className="w-5 h-5 rounded flex items-center justify-center text-gray-400 hover:bg-gray-100 flex-shrink-0 transition-colors">
            {open ? <ChevronDown size={12} /> : <ChevronRightIcon size={12} />}
          </button>
        ) : <span className="w-5 h-5 flex-shrink-0" />}
        <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-sm">
          {node.name?.[0]?.toUpperCase() ?? "?"}
        </div>
        <span className="text-xs font-semibold text-gray-800">{node.name}</span>
        <span className={`text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full ${ROLE_BADGE[primaryRole] ?? "bg-gray-100 text-gray-500"}`}>
          {primaryRole}
        </span>
        {hasChildren && <span className="text-[10px] text-gray-400">{node.children.length} direct</span>}
      </div>
      {open && hasChildren && (
        <div className="mt-1 mb-2">
          {node.children.map(child => <TreeNode key={child._id} node={child} depth={depth + 1} />)}
        </div>
      )}
    </div>
  );
};

// ── Main Component ───────────────────────────────────────────────────────────
const MasterAnalytics = () => {
  // Seller Analytics state
  const [sellerData, setSellerData] = useState(null);
  const [loadingSeller, setLoadingSeller] = useState(true);

  // Pipeline/Network state
  const [funnel,      setFunnel]      = useState([]);
  const [sources,     setSources]     = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [tree,        setTree]        = useState([]);
  const [loadingPipeline, setLoadingPipeline] = useState(true);
  const [loadingNetwork,  setLoadingNetwork]  = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // 1. Seller analytics
    axios.get("/api/admin/seller-analytics", { withCredentials: true })
      .then(({ data }) => setSellerData(data))
      .catch(err => setError(err?.response?.data?.message || "Failed to load seller analytics."))
      .finally(() => setLoadingSeller(false));

    // 2. Pipeline funnel + lead sources
    Promise.all([
      axios.get("/api/admin/analytics/pipeline-funnel", { withCredentials: true }),
      axios.get("/api/admin/analytics/lead-sources",    { withCredentials: true }),
    ])
      .then(([fRes, sRes]) => {
        setFunnel(fRes.data.funnel);
        setSources(sRes.data.sources);
      })
      .catch(() => {})
      .finally(() => setLoadingPipeline(false));

    // 3. Team leaderboard + genealogy tree
    Promise.all([
      axios.get("/api/admin/analytics/team-leaderboard", { withCredentials: true }),
      axios.get("/api/admin/analytics/genealogy-tree",   { withCredentials: true }),
    ])
      .then(([lbRes, treeRes]) => {
        setLeaderboard(lbRes.data.leaderboard);
        setTree(treeRes.data.tree);
      })
      .catch(() => {})
      .finally(() => setLoadingNetwork(false));
  }, []);

  const totalLeads = funnel.reduce((s, x) => s + x.count, 0);
  const totalSources = sources.reduce((s, x) => s + x.count, 0);
  const currentYear = new Date().getFullYear();

  const { lastMonthTop10, yearlyChartData, allSellersList } = sellerData ?? {
    lastMonthTop10: [], yearlyChartData: [], allSellersList: []
  };

  return (
    <div className="bg-gray-50 min-h-full p-6">
      {/* ── Page Header ── */}
      <div className="mb-7">
        <h1 className="text-3xl font-extrabold text-gray-900">Super Analytics</h1>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>
      )}

      {/* ══════════════════════════════════════════════════
          SECTION 1 — Leaderboard | Funnel | Pie
      ══════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

        {/* Col 1 — Last Month Leaderboard */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col">
          <CardHeader icon={Trophy} iconBg="bg-amber-500" title="Last Month's Leaderboard" subtitle="Top sellers by conversion ratio" />
          {loadingSeller ? (
            <div className="space-y-2 flex-1">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-10 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : lastMonthTop10.length === 0 ? (
            <Empty label="No data for last month yet." />
          ) : (
            <div className="space-y-1.5 overflow-y-auto flex-1">
              {lastMonthTop10.map((seller, idx) => (
                <div key={idx}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors">
                  {/* Rank */}
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold flex-shrink-0 ${
                    idx === 0 ? "bg-amber-400 text-amber-900"
                    : idx === 1 ? "bg-gray-300 text-gray-700"
                    : idx === 2 ? "bg-orange-300 text-orange-800"
                    : "bg-gray-100 text-gray-500"
                  }`}>{idx + 1}</span>
                  {/* Avatar */}
                  {seller.avatar ? (
                    <img src={seller.avatar} alt={seller.name}
                      className="w-8 h-8 rounded-full object-cover border border-gray-200 flex-shrink-0" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 font-extrabold text-sm flex items-center justify-center flex-shrink-0">
                      {seller.name?.[0]?.toUpperCase() ?? "?"}
                    </div>
                  )}
                  {/* Name */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-800 truncate">{seller.name}</p>
                    <p className="text-[10px] text-gray-400">{seller.totalApproved}/{seller.totalAssigned} leads</p>
                  </div>
                  <RatioBadge ratio={seller.ratio} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Col 2 — Pipeline Funnel */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col">
          <CardHeader icon={TrendingDown} iconBg="bg-indigo-500" title="Sales Pipeline Funnel" subtitle={`${totalLeads} leads across all stages`} />
          {loadingPipeline ? (
            <div className="flex-1 bg-gray-100 rounded-xl animate-pulse" />
          ) : totalLeads === 0 ? (
            <Empty label="No pipeline data yet." />
          ) : (
            <>
              <ResponsiveContainer width="100%" height={280}>
                <FunnelChart>
                  <FunnelTip />
                  <Funnel
                    dataKey="count"
                    data={funnel.map((d, i) => ({ ...d, fill: FUNNEL_COLORS[i % FUNNEL_COLORS.length] }))}
                    isAnimationActive
                  >
                    <LabelList
                      position="right"
                      content={({ x, y, width, height, value, index }) => {
                        const stage = funnel[index]?.stage ?? "";
                        return (
                          <text x={(x ?? 0) + (width ?? 0) + 6} y={(y ?? 0) + (height ?? 0) / 2}
                            fill="#374151" fontSize={10} fontWeight={600} dominantBaseline="middle">
                            {stage} ({value})
                          </text>
                        );
                      }}
                    />
                  </Funnel>
                </FunnelChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-1.5 justify-center mt-2">
                {funnel.map((d, i) => (
                  <div key={d.stage} className="flex items-center gap-1 text-[10px] font-medium text-gray-600">
                    <span className="w-2 h-2 rounded-full" style={{ background: FUNNEL_COLORS[i % FUNNEL_COLORS.length] }} />
                    {d.stage}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Col 3 — Lead Source Pie */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col">
          <CardHeader icon={PieIcon} iconBg="bg-emerald-500" title="Lead Source Breakdown" subtitle={`${totalSources} total leads tracked`} />
          {loadingPipeline ? (
            <div className="flex-1 bg-gray-100 rounded-xl animate-pulse" />
          ) : sources.length === 0 ? (
            <Empty label="No source data yet." />
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={sources} dataKey="count" nameKey="source"
                    cx="50%" cy="50%" outerRadius={80} innerRadius={40} paddingAngle={3} isAnimationActive>
                    {sources.map((entry, i) => (
                      <Cell key={entry.source}
                        fill={SOURCE_COLORS[entry.source] ?? FALLBACK_COLORS[i % FALLBACK_COLORS.length]}
                        stroke="white" strokeWidth={2} />
                    ))}
                  </Pie>
                  <PieTip />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-2 divide-y divide-gray-50 flex-1 overflow-y-auto">
                {sources.map((s, i) => (
                  <div key={s.source} className="flex items-center justify-between py-1.5 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: SOURCE_COLORS[s.source] ?? FALLBACK_COLORS[i % FALLBACK_COLORS.length] }} />
                      <span className="font-medium text-gray-700">{s.source}</span>
                    </div>
                    <div className="flex gap-2 text-gray-400">
                      <span>{s.count}</span>
                      <span className="font-bold text-gray-600">{s.pct}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          SECTION 2 — Teams Table | Conv Bar | Sellers Table
      ══════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

        {/* Col 1 — Top Performing Teams */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col">
          <CardHeader icon={Trophy} iconBg="bg-amber-400" title="Top Performing Teams" subtitle="Ranked by Closed Won leads" />
          {loadingNetwork ? (
            <div className="space-y-2">
              {[1,2,3].map(i => <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />)}
            </div>
          ) : leaderboard.length === 0 ? (
            <Empty label="No team data yet. Sub-sellers needed." />
          ) : (
            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left px-2 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wide border-b border-gray-100">#</th>
                    <th className="text-left px-2 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wide border-b border-gray-100">Leader</th>
                    <th className="text-left px-2 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wide border-b border-gray-100">Size</th>
                    <th className="text-left px-2 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wide border-b border-gray-100">Sales</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((row, idx) => (
                    <tr key={row._id}
                      className={`border-b border-gray-50 last:border-b-0 hover:bg-gray-50/60 transition-colors ${ROW_BORDER[idx] ?? "border-l-4 border-transparent"}`}>
                      <td className="px-2 py-2.5">
                        <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-extrabold ${RANK_STYLE[idx] ?? "bg-gray-100 text-gray-500"}`}>
                          {idx + 1}
                        </span>
                      </td>
                      <td className="px-2 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center flex-shrink-0">
                            {row.name?.[0]?.toUpperCase() ?? "?"}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800 text-xs">{row.name}</p>
                            {row.phone && <p className="text-[10px] text-gray-400">{row.phone}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-2 py-2.5">
                        <div className="flex items-center gap-1 text-gray-600 text-xs">
                          <Users size={11} className="text-gray-400" />
                          <span className="font-semibold">{row.teamSize}</span>
                        </div>
                      </td>
                      <td className="px-2 py-2.5">
                        <span className={`text-base font-extrabold ${idx === 0 ? "text-amber-600" : idx === 1 ? "text-gray-500" : idx === 2 ? "text-orange-500" : "text-gray-700"}`}>
                          {row.totalSales}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Col 2 — Monthly Conversions Bar Chart */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col">
          <CardHeader icon={BarChart2} iconBg="bg-brand-600" title={`${currentYear} Conversion Trend`} subtitle="Monthly customer conversions" />
          {loadingSeller ? (
            <div className="flex-1 bg-gray-100 rounded-xl animate-pulse" />
          ) : !yearlyChartData || yearlyChartData.every(d => d.conversions === 0) ? (
            <Empty label="No conversions recorded this year yet." />
          ) : (
            <div className="flex-1">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={yearlyChartData} barSize={22}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<BarTip />} cursor={{ fill: "#f3f4f6", radius: 8 }} />
                  <Bar dataKey="conversions" fill="url(#barGrad)" radius={[5, 5, 0, 0]} />
                  <defs>
                    <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#7c3aed" stopOpacity={0.7} />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Col 3 — All Sellers (scrollable) */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col">
          <CardHeader icon={List} iconBg="bg-emerald-500" title="All Sellers" subtitle="Full breakdown by conversion ratio" />
          {loadingSeller ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => <div key={i} className="h-9 bg-gray-100 rounded-xl animate-pulse" />)}
            </div>
          ) : !allSellersList || allSellersList.length === 0 ? (
            <Empty label="No sellers found." />
          ) : (
            <div className="max-h-80 overflow-y-auto relative flex-1">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-white z-10">
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-3 py-2 text-[10px] font-bold text-gray-400 uppercase">#</th>
                    <th className="text-left px-3 py-2 text-[10px] font-bold text-gray-400 uppercase">Seller</th>
                    <th className="text-left px-3 py-2 text-[10px] font-bold text-gray-400 uppercase">Leads</th>
                    <th className="text-left px-3 py-2 text-[10px] font-bold text-gray-400 uppercase">Conv.</th>
                    <th className="text-left px-3 py-2 text-[10px] font-bold text-gray-400 uppercase">Ratio</th>
                  </tr>
                </thead>
                <tbody>
                  {allSellersList.map((seller, idx) => (
                    <tr key={seller._id} className="hover:bg-gray-50/70 transition-colors border-b border-gray-50 last:border-b-0">
                      <td className="px-3 py-2 text-gray-400 text-xs">{idx + 1}</td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          {seller.avatar ? (
                            <img src={seller.avatar} alt={seller.name}
                              className="w-6 h-6 rounded-full object-cover border border-gray-200 flex-shrink-0" />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 font-bold text-[10px] flex items-center justify-center flex-shrink-0">
                              {seller.name?.[0]?.toUpperCase() ?? "?"}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-800 text-xs truncate max-w-[80px]">{seller.name}</p>
                            {seller.phone && (
                              <a href={`tel:${seller.phone}`} className="flex items-center gap-0.5 text-emerald-600 text-[10px]">
                                <Phone size={9} />{seller.phone}
                              </a>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-xs font-bold text-gray-700">{seller.totalAssigned}</td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-1">
                          <TrendingUp size={11} className="text-emerald-500" />
                          <span className="text-xs font-bold text-emerald-700">{seller.totalApproved}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2"><RatioBadge ratio={seller.ratio} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {allSellersList && allSellersList.length > 0 && (
            <p className="text-[10px] text-gray-400 border-t border-gray-50 pt-2 mt-2">
              {allSellersList.length} seller{allSellersList.length !== 1 ? "s" : ""} total
            </p>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          SECTION 3 — Genealogy Tree | Quick Stats
      ══════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Col 1+2 — Genealogy Tree */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
              <Network size={16} className="text-purple-600" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-gray-900 uppercase tracking-wide">Agency Network Hierarchy</h2>
              <p className="text-xs text-gray-400">Full referral tree — click arrows to expand / collapse</p>
            </div>
          </div>
          {loadingNetwork ? (
            <div className="space-y-4 animate-pulse">
              {[1,2,3].map(i => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-gray-200 rounded" />
                  <div className="w-7 h-7 bg-gray-200 rounded-full" />
                  <div className="h-4 bg-gray-200 rounded w-32" />
                </div>
              ))}
            </div>
          ) : tree.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-300">
              <Network size={36} className="mb-2" />
              <p className="text-sm text-gray-400">No hierarchy data yet.</p>
            </div>
          ) : (
            <div>
              {tree.map(node => <TreeNode key={node._id} node={node} depth={0} />)}
            </div>
          )}
        </div>

        {/* Col 3 — Quick Stats Summary */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-4">
          <div>
            <h2 className="text-sm font-extrabold text-gray-900 uppercase tracking-wide mb-1">Quick Stats</h2>
            <p className="text-xs text-gray-400">Summary across all datasets</p>
          </div>
          <div className="grid grid-cols-2 gap-3 flex-1">
            <div className="bg-indigo-50 rounded-xl p-4 text-center border border-indigo-100">
              <p className="text-2xl font-black text-indigo-700">{totalLeads}</p>
              <p className="text-[10px] font-bold uppercase tracking-wide text-indigo-500 mt-1">Pipeline Leads</p>
            </div>
            <div className="bg-emerald-50 rounded-xl p-4 text-center border border-emerald-100">
              <p className="text-2xl font-black text-emerald-700">
                {allSellersList?.reduce((acc, s) => acc + (s.totalApproved || 0), 0) ?? 0}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-500 mt-1">Total Conversions</p>
            </div>
            <div className="bg-amber-50 rounded-xl p-4 text-center border border-amber-100">
              <p className="text-2xl font-black text-amber-700">{allSellersList?.length ?? 0}</p>
              <p className="text-[10px] font-bold uppercase tracking-wide text-amber-500 mt-1">Total Sellers</p>
            </div>
            <div className="bg-purple-50 rounded-xl p-4 text-center border border-purple-100">
              <p className="text-2xl font-black text-purple-700">{leaderboard.length}</p>
              <p className="text-[10px] font-bold uppercase tracking-wide text-purple-500 mt-1">Active Teams</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100 col-span-2">
              <p className="text-2xl font-black text-gray-700">{sources.length}</p>
              <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400 mt-1">Lead Sources Tracked</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MasterAnalytics;
