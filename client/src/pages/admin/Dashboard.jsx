import React, { useEffect, useState } from "react";
import axios from "axios";
import { Users, UserCheck, Store, Home } from "lucide-react";
import StatCard from "../../components/admin/dashboard/StatCard";
import IdleLeadsWidget from "../../components/admin/dashboard/IdleLeadsWidget";
import MonthlyTargetSetter from "../../components/admin/dashboard/MonthlyTargetSetter";
import AdminTimelineViewer from "./AdminTimelineViewer";

const Dashboard = () => {
  const [stats, setStats]                       = useState(null);
  const [pendingConversions, setPendingConversions] = useState(0);
  const [loading, setLoading]                   = useState(true);
  const [error, setError]                       = useState("");
  const [timelineModal, setTimelineModal]       = useState(null); // { leadId, leadName }

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [statsRes, convRes] = await Promise.all([
          axios.get("/api/admin/stats",              { withCredentials: true }),
          axios.get("/api/admin/conversion-stats",   { withCredentials: true }),
        ]);
        setStats(statsRes.data);
        setPendingConversions(convRes.data.totalPending ?? 0);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load dashboard stats.");
      } finally { setLoading(false); }
    };
    fetchAll();
  }, []);

  const cards = [
    { icon: Users,     label: "Total Users",            value: stats?.totalUsers,     color: "bg-brand-600" },
    { icon: UserCheck, label: "Total Customers",         value: stats?.totalCustomers,  color: "bg-emerald-500" },
    { icon: Store,     label: "Total Sellers",           value: stats?.totalSellers,    color: "bg-amber-500",
      badge: pendingConversions, to: "/admin-panel/sellers-performance" },
    { icon: Home,      label: "Total Sold Apartments",  value: stats?.totalSold,       color: "bg-rose-500" },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Admin Panel</p>
        <h1 className="text-3xl font-extrabold text-gray-900">Command Center</h1>
        <p className="text-gray-500 text-sm mt-1">
          Platform oversight, idle lead alerts, and monthly target control.
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {cards.map(card => <StatCard key={card.label} {...card} loading={loading} />)}
      </div>

      {/* Bottom two-column layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">🔴 Idle Leads Monitor</p>
          <IdleLeadsWidget onViewTimeline={(id, name) => setTimelineModal({ leadId: id, leadName: name })} />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">🎯 Monthly Target</p>
          <MonthlyTargetSetter />
        </div>
      </div>

      {/* 360° Timeline Modal */}
      {timelineModal && (
        <AdminTimelineViewer
          leadId={timelineModal.leadId}
          leadTitle={timelineModal.leadName}
          onClose={() => setTimelineModal(null)}
        />
      )}
    </div>
  );
};

export default Dashboard;
