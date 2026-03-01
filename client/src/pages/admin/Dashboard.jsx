import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Users, UserCheck, Store, Home } from "lucide-react";

// ── Stat Card ─────────────────────────────────────────────────────────────────
// `badge` = optional red number to show on the card
// `to`    = optional react-router link target
const StatCard = ({ icon: Icon, label, value, color, loading, badge, to }) => {
  const inner = (
    <div className="relative bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-5 transition-all hover:shadow-md hover:-translate-y-0.5 cursor-pointer group">
      {/* Red notification badge */}
      {badge > 0 && (
        <span className="absolute -top-2 -right-2 z-10 bg-red-500 text-white text-[11px] font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg animate-bounce">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${color} group-hover:scale-105 transition-transform`}>
        <Icon size={26} className="text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        {loading ? (
          <div className="mt-1 h-8 w-16 bg-gray-200 rounded-lg animate-pulse" />
        ) : (
          <p className="text-3xl font-extrabold text-gray-800 mt-0.5">{value ?? 0}</p>
        )}
      </div>
    </div>
  );

  return to ? <Link to={to} className="block">{inner}</Link> : inner;
};

// ── Dashboard ─────────────────────────────────────────────────────────────────
const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [pendingConversions, setPendingConversions] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [statsRes, convRes] = await Promise.all([
          axios.get("/api/admin/stats", { withCredentials: true }),
          axios.get("/api/admin/conversion-stats", { withCredentials: true }),
        ]);
        setStats(statsRes.data);
        setPendingConversions(convRes.data.totalPending ?? 0);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load dashboard stats.");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const cards = [
    {
      icon: Users,
      label: "Total Users",
      value: stats?.totalUsers,
      color: "bg-brand-600",
    },
    {
      icon: UserCheck,
      label: "Total Customers",
      value: stats?.totalCustomers,
      color: "bg-emerald-500",
    },
    {
      icon: Store,
      label: "Total Sellers",
      value: stats?.totalSellers,
      color: "bg-amber-500",
      badge: pendingConversions,        // 🔴 notification badge
      to: "/admin-panel/sellers-performance", // 🔗 clickable link
    },
    {
      icon: Home,
      label: "Total Sold Apartments",
      value: stats?.totalSold,
      color: "bg-rose-500",
    },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">
          Admin Panel
        </p>
        <h1 className="text-3xl font-extrabold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          Platform overview and quick stats at a glance.
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {cards.map((card) => (
          <StatCard key={card.label} {...card} loading={loading} />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
