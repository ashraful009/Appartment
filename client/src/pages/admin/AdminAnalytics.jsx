import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  ResponsiveContainer,
  FunnelChart, Funnel, LabelList,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { TrendingDown, PieChart as PieIcon, InboxIcon, Trophy, Network, Users } from "lucide-react";
import { ChartSkeleton, FunnelTip, PieTip, TreeNode } from "../../components/admin/analytics/AnalyticsShared";

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
  "border-l-4 border-amber-400",
  "border-l-4 border-gray-400",
  "border-l-4 border-orange-400",
];

const AdminAnalytics = () => {
  const [funnel,      setFunnel]      = useState([]);
  const [sources,     setSources]     = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [tree,        setTree]        = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [loadingNet,  setLoadingNet]  = useState(true);
  const [error,       setError]       = useState("");

  useEffect(() => {
    Promise.all([
      axios.get("/api/admin/analytics/pipeline-funnel", { withCredentials: true }),
      axios.get("/api/admin/analytics/lead-sources",    { withCredentials: true }),
    ]).then(([fRes, sRes]) => {
      setFunnel(fRes.data.funnel);
      setSources(sRes.data.sources);
    }).catch(err => setError(err?.response?.data?.message || "Failed to load analytics data."))
      .finally(() => setLoading(false));

    Promise.all([
      axios.get("/api/admin/analytics/team-leaderboard", { withCredentials: true }),
      axios.get("/api/admin/analytics/genealogy-tree",   { withCredentials: true }),
    ]).then(([lbRes, treeRes]) => {
      setLeaderboard(lbRes.data.leaderboard);
      setTree(treeRes.data.tree);
    }).catch(() => {}).finally(() => setLoadingNet(false));
  }, []);

  const totalLeads   = funnel.reduce((s, x) => s + x.count, 0);
  const totalSources = sources.reduce((s, x) => s + x.count, 0);

  return (
    <div className="p-8 space-y-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Admin Panel</p>
        <h1 className="text-3xl font-extrabold text-gray-900">Pipeline & Lead Analytics</h1>
        <p className="text-gray-500 text-sm mt-1">Visual breakdown of your sales funnel and where leads are coming from.</p>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>}

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {loading ? <ChartSkeleton /> : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
                <TrendingDown size={17} className="text-indigo-600" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-gray-800">Sales Pipeline Funnel</h2>
                <p className="text-xs text-gray-400">{totalLeads} leads across all stages</p>
              </div>
            </div>
            {totalLeads === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-300">
                <InboxIcon size={40} className="mb-3" />
                <p className="text-sm text-gray-400">No lead pipeline data yet.</p>
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <FunnelChart>
                    <FunnelTip />
                    <Funnel dataKey="count" data={funnel.map((d, i) => ({ ...d, fill: FUNNEL_COLORS[i % FUNNEL_COLORS.length] }))} isAnimationActive>
                      <LabelList position="right" content={({ x, y, width, height, value, index }) => {
                        const stage = funnel[index]?.stage ?? "";
                        return <text x={(x ?? 0) + (width ?? 0) + 8} y={(y ?? 0) + (height ?? 0) / 2}
                          fill="#374151" fontSize={11} fontWeight={600} dominantBaseline="middle">
                          {stage} ({value})
                        </text>;
                      }} />
                    </Funnel>
                  </FunnelChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-2 justify-center mt-2">
                  {funnel.map((d, i) => (
                    <div key={d.stage} className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: FUNNEL_COLORS[i % FUNNEL_COLORS.length] }} />{d.stage}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {loading ? <ChartSkeleton /> : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <PieIcon size={17} className="text-emerald-600" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-gray-800">Lead Source Breakdown</h2>
                <p className="text-xs text-gray-400">{totalSources} total leads tracked</p>
              </div>
            </div>
            {sources.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-300">
                <InboxIcon size={40} className="mb-3" />
                <p className="text-sm text-gray-400">No source data yet.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie data={sources} dataKey="count" nameKey="source" cx="50%" cy="45%" outerRadius={110} innerRadius={52} paddingAngle={3} isAnimationActive>
                    {sources.map((entry, i) => (
                      <Cell key={entry.source} fill={SOURCE_COLORS[entry.source] ?? FALLBACK_COLORS[i % FALLBACK_COLORS.length]} stroke="white" strokeWidth={2} />
                    ))}
                  </Pie>
                  <PieTip />
                  <Legend content={({ payload }) => (
                    <div className="flex flex-wrap gap-2 justify-center mt-1">
                      {(payload ?? []).map((entry, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
                          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: entry.color }} />
                          {entry.value} ({sources.find(s => s.source === entry.value)?.pct ?? 0}%)
                        </div>
                      ))}
                    </div>
                  )} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        )}
      </div>

      {/* Leaderboard */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0"><Trophy size={17} className="text-amber-600" /></div>
          <div>
            <h2 className="text-base font-extrabold text-gray-800">Top Performing Teams</h2>
            <p className="text-xs text-gray-400">Parent sellers ranked by team Closed Won leads</p>
          </div>
        </div>
        {loadingNet ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-3 animate-pulse">
            {[1,2,3].map(i => <div key={i} className="h-12 bg-gray-100 rounded-xl" />)}
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-12 text-gray-300">
            <InboxIcon size={36} className="mb-2" />
            <p className="text-sm text-gray-400">No team data yet. Sub-sellers needed.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-500 w-12">#</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-500">Team Leader</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-500">Team Size</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-500">Total Team Sales</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((row, idx) => (
                  <tr key={row._id} className={`border-b border-gray-50 last:border-b-0 hover:bg-gray-50/60 transition-colors ${ROW_BORDER[idx] ?? "border-l-4 border-transparent"}`}>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-extrabold ${RANK_STYLE[idx] ?? "bg-gray-100 text-gray-500"}`}>{idx + 1}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm flex items-center justify-center flex-shrink-0">
                          {row.name?.[0]?.toUpperCase() ?? "?"}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{row.name}</p>
                          {row.phone && <p className="text-xs text-gray-400">{row.phone}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-gray-600"><Users size={13} className="text-gray-400" /><span className="font-semibold">{row.teamSize}</span><span className="text-xs text-gray-400">members</span></div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xl font-extrabold ${idx === 0 ? "text-amber-600" : idx === 1 ? "text-gray-500" : idx === 2 ? "text-orange-500" : "text-gray-700"}`}>{row.totalSales}</span>
                      <span className="text-xs text-gray-400 ml-1.5">Closed Won</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Genealogy Tree */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0"><Network size={17} className="text-purple-600" /></div>
          <div>
            <h2 className="text-base font-extrabold text-gray-800">Agency Network Hierarchy (Genealogy)</h2>
            <p className="text-xs text-gray-400">Full referral tree — click arrows to expand / collapse</p>
          </div>
        </div>
        {loadingNet ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4 animate-pulse">
            {[1,2,3].map(i => <div key={i} className="flex items-center gap-3"><div className="w-5 h-5 bg-gray-200 rounded" /><div className="w-7 h-7 bg-gray-200 rounded-full" /><div className="h-4 bg-gray-200 rounded w-32" /></div>)}
          </div>
        ) : tree.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-12 text-gray-300">
            <Network size={36} className="mb-2" />
            <p className="text-sm text-gray-400">No hierarchy data yet.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 overflow-x-auto">
            {tree.map(node => <TreeNode key={node._id} node={node} depth={0} />)}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAnalytics;
