import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  ResponsiveContainer,
  BarChart, Bar,
  XAxis, YAxis,
  Tooltip, CartesianGrid,
} from "recharts";
import { TrendingUp, Phone, User2, Trophy, BarChart2, List, InboxIcon } from "lucide-react";

// ── Ratio Badge ───────────────────────────────────────────────────────────────
const RatioBadge = ({ ratio }) => {
  const pct  = Math.round((ratio ?? 0) * 100);
  const color = pct >= 70 ? "emerald" : pct >= 40 ? "amber" : "red";
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold
                      bg-${color}-100 text-${color}-700`}>
      {pct}%
    </span>
  );
};

// ── Custom Tooltip for chart ──────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-900 text-white rounded-xl px-4 py-2.5 shadow-xl text-sm">
      <p className="font-bold mb-1">{label}</p>
      <p className="text-brand-400 font-semibold">{payload[0].value} conversions</p>
    </div>
  );
};

// ── Section Header ────────────────────────────────────────────────────────────
const SectionHeader = ({ icon: Icon, title, subtitle, iconBg }) => (
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

// ── Main Component ────────────────────────────────────────────────────────────
const SellersAnalytics = () => {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const { data: res } = await axios.get("/api/admin/seller-analytics", {
          withCredentials: true,
        });
        setData(res);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load analytics.");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  // ── Skeleton ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="p-8 space-y-10">
        <div className="h-8 w-64 bg-gray-200 rounded-xl animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 animate-pulse">
              <div className="w-12 h-12 bg-gray-200 rounded-full mx-auto mb-3" />
              <div className="h-3.5 bg-gray-200 rounded w-3/4 mx-auto" />
            </div>
          ))}
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-6 h-64 animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>
      </div>
    );
  }

  const { lastMonthTop10, yearlyChartData, allSellersList } = data;
  const currentYear = new Date().getFullYear();

  return (
    <div className="p-8 space-y-10">
      {/* Page Header */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Admin Panel</p>
        <h1 className="text-3xl font-extrabold text-gray-900">Seller Analytics</h1>
        <p className="text-gray-500 text-sm mt-1">
          Leaderboard, yearly conversion trend, and full seller performance breakdown.
        </p>
      </div>

      {/* ── SECTION 1: Last Month Top 10 ─────────────────────────────────── */}
      <section>
        <SectionHeader
          icon={Trophy}
          title="Last Month's Leaderboard"
          subtitle="Top 10 sellers by conversion ratio"
          iconBg="bg-amber-500"
        />

        {lastMonthTop10.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center bg-white rounded-2xl border border-gray-100">
            <InboxIcon size={40} className="text-gray-200 mb-3" />
            <p className="text-gray-400 text-sm">No data for last month yet.</p>
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1">
            {lastMonthTop10.map((seller, idx) => (
              <div
                key={idx}
                className="flex-shrink-0 w-44 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col items-center text-center hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                {/* Rank badge */}
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-extrabold mb-3 ${
                  idx === 0 ? "bg-amber-400 text-amber-900"
                  : idx === 1 ? "bg-gray-300 text-gray-700"
                  : idx === 2 ? "bg-orange-300 text-orange-800"
                  : "bg-gray-100 text-gray-500"
                }`}>
                  {idx + 1}
                </div>

                {/* Avatar */}
                {seller.avatar ? (
                  <img src={seller.avatar} alt={seller.name}
                    className="w-14 h-14 rounded-full object-cover mb-2 border-2 border-brand-100" />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-brand-100 text-brand-700 font-extrabold text-xl flex items-center justify-center mb-2">
                    {seller.name?.[0]?.toUpperCase() ?? "?"}
                  </div>
                )}

                <p className="font-bold text-gray-800 text-sm truncate w-full">{seller.name}</p>
                {seller.phone && (
                  <p className="text-xs text-gray-400 flex items-center gap-1 justify-center mt-0.5">
                    <Phone size={10} />{seller.phone}
                  </p>
                )}

                {/* Ratio */}
                <div className="mt-3">
                  <RatioBadge ratio={seller.ratio} />
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {seller.totalApproved}/{seller.totalAssigned} leads
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── SECTION 2: Yearly Conversion Chart ───────────────────────────── */}
      <section>
        <SectionHeader
          icon={BarChart2}
          title={`${currentYear} Conversion Trend`}
          subtitle="Monthly customer conversions this year"
          iconBg="bg-brand-600"
        />

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          {yearlyChartData.every((d) => d.conversions === 0) ? (
            <div className="flex flex-col items-center justify-center h-52 text-center">
              <InboxIcon size={40} className="text-gray-200 mb-3" />
              <p className="text-gray-400 text-sm">No conversions recorded this year yet.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={yearlyChartData} barSize={36}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 12, fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: "#f3f4f6", radius: 8 }} />
                <Bar
                  dataKey="conversions"
                  fill="url(#barGradient)"
                  radius={[6, 6, 0, 0]}
                />
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#7c3aed" stopOpacity={0.7} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      {/* ── SECTION 3: All Sellers Table ─────────────────────────────────── */}
      <section>
        <SectionHeader
          icon={List}
          title="All Sellers — Full Breakdown"
          subtitle="Sorted by conversion ratio (highest first)"
          iconBg="bg-emerald-500"
        />

        {allSellersList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center bg-white rounded-2xl border border-gray-100">
            <InboxIcon size={40} className="text-gray-200 mb-3" />
            <p className="text-gray-400 text-sm">No sellers found.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-5 py-3.5 font-semibold text-gray-600">#</th>
                    <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Seller</th>
                    <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Phone</th>
                    <th className="text-left px-5 py-3.5 font-semibold text-gray-600 whitespace-nowrap">Assigned Work</th>
                    <th className="text-left px-5 py-3.5 font-semibold text-gray-600 whitespace-nowrap">Converted Customers</th>
                    <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Ratio</th>
                  </tr>
                </thead>
                <tbody>
                  {allSellersList.map((seller, idx) => (
                    <tr key={seller._id} className="hover:bg-gray-50/70 transition-colors border-b border-gray-100 last:border-b-0">
                      <td className="px-5 py-4 text-gray-400 font-medium text-xs">{idx + 1}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {seller.avatar ? (
                            <img src={seller.avatar} alt={seller.name}
                              className="w-8 h-8 rounded-full object-cover border border-gray-200" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 font-bold text-xs flex items-center justify-center flex-shrink-0">
                              {seller.name?.[0]?.toUpperCase() ?? "?"}
                            </div>
                          )}
                          <span className="font-semibold text-gray-800">{seller.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-gray-500">
                        {seller.phone ? (
                          <a href={`tel:${seller.phone}`} className="flex items-center gap-1 text-emerald-600 hover:underline text-xs">
                            <Phone size={11} />{seller.phone}
                          </a>
                        ) : "—"}
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-extrabold text-gray-800 text-base">{seller.totalAssigned}</span>
                        <span className="text-xs text-gray-400 ml-1">leads</span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          <TrendingUp size={13} className="text-emerald-500" />
                          <span className="font-extrabold text-emerald-700 text-base">{seller.totalApproved}</span>
                          <span className="text-xs text-gray-400">customers</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <RatioBadge ratio={seller.ratio} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="px-5 py-3 text-xs text-gray-400 border-t border-gray-100">
              {allSellersList.length} seller{allSellersList.length !== 1 ? "s" : ""} total
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

export default SellersAnalytics;
