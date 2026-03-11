import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import {
  Users, UserCheck, Store, Home,
  AlertTriangle, Clock, Target, Loader2,
  RefreshCw, UserX, Eye, CheckCheck,
} from "lucide-react";
import AdminTimelineViewer from "./AdminTimelineViewer";

// ─────────────────────────────────────────────────────────────────────────────
// Stat Card
// ─────────────────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, color, loading, badge, to }) => {
  const inner = (
    <div className="relative bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-5 transition-all hover:shadow-md hover:-translate-y-0.5 cursor-pointer group">
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

// ─────────────────────────────────────────────────────────────────────────────
// Idle Leads Alert Widget
// ─────────────────────────────────────────────────────────────────────────────
const IdleLeadsWidget = ({ onViewTimeline }) => {
  const [idleLeads, setIdleLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("/api/admin/idle-leads", { withCredentials: true })
      .then(({ data }) => setIdleLeads(data.idleLeads))
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  const daysSince = (dateStr) => {
    if (!dateStr) return "∞";
    const diff = Date.now() - new Date(dateStr).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  if (loading) return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="h-5 bg-gray-200 rounded w-48 mb-4 animate-pulse" />
      <div className="space-y-3">
        {[1, 2, 3].map(i => <div key={i} className="h-10 bg-gray-100 rounded-xl animate-pulse" />)}
      </div>
    </div>
  );

  if (idleLeads.length === 0) return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
        <CheckCheck size={20} className="text-emerald-600" />
      </div>
      <div>
        <p className="font-bold text-gray-800 text-sm">No Idle Leads</p>
        <p className="text-xs text-gray-400">All leads have recent activity. Great job!</p>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl border border-red-200 shadow-sm overflow-hidden">
      {/* Red alert banner */}
      <div className="flex items-center gap-3 px-5 py-3 bg-red-50 border-b border-red-200">
        <AlertTriangle size={16} className="text-red-500 flex-shrink-0 animate-pulse" />
        <div className="flex-1">
          <p className="text-sm font-extrabold text-red-700">
            Idle Leads — At Risk ({idleLeads.length})
          </p>
          <p className="text-xs text-red-500">These leads have had no activity in 7+ days.</p>
        </div>
      </div>

      {/* Lead list */}
      <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto">
        {idleLeads.map(lead => {
          const days = daysSince(lead.lastInteractionDate);
          const seller = lead.assignedTo;
          const client = lead.user;

          return (
            <div key={lead._id} className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50 transition-colors">
              {/* Urgency badge */}
              <div className={`flex-shrink-0 text-center w-12 ${days >= 14 ? "text-red-600" : "text-orange-500"}`}>
                <p className="text-xl font-extrabold leading-none">{days}</p>
                <p className="text-[9px] font-semibold uppercase tracking-wide opacity-70">days</p>
              </div>

              {/* Lead info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">
                  {client?.name || "Unknown Client"}
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                  <UserX size={11} />
                  <span>Assigned to: <span className="font-medium text-gray-600">{seller?.name || "Unassigned"}</span></span>
                  {seller?.phone && <span>· {seller.phone}</span>}
                </div>
              </div>

              {/* Last contact */}
              <div className="hidden sm:block text-right flex-shrink-0">
                <p className="text-xs text-gray-400">Last contact</p>
                <p className="text-xs font-medium text-gray-600">
                  {lead.lastInteractionDate
                    ? new Date(lead.lastInteractionDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })
                    : "Never"}
                </p>
              </div>

              {/* View Timeline button */}
              <button
                onClick={() => onViewTimeline(lead._id, client?.name || "Lead")}
                className="flex-shrink-0 flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-800 bg-brand-50 hover:bg-brand-100 border border-brand-200 px-2.5 py-1.5 rounded-lg transition-colors"
              >
                <Eye size={11} /> View
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Monthly Target Setter
// ─────────────────────────────────────────────────────────────────────────────
const MonthlyTargetSetter = () => {
  const now = new Date();
  const currentMonth = now.toLocaleString("en-US", { month: "long" });
  const currentYear = now.getFullYear();

  const [targetValue, setTargetValue] = useState("");
  const [current, setCurrent] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loadingCurrent, setLoadingCurrent] = useState(true);

  useEffect(() => {
    axios.get("/api/targets/current", { withCredentials: true })
      .then(({ data }) => {
        setCurrent(data.target);
        if (data.target) setTargetValue(String(data.target.globalTarget));
      })
      .catch(() => { })
      .finally(() => setLoadingCurrent(false));
  }, []);

  const handleSave = async () => {
    const num = Number(targetValue);
    if (!targetValue || isNaN(num) || num < 0) {
      toast.error("Please enter a valid positive number.");
      return;
    }
    setSaving(true);
    try {
      const { data } = await axios.post("/api/admin/targets", {
        month: currentMonth,
        year: currentYear,
        globalTarget: num,
      }, { withCredentials: true });
      setCurrent(data.target);
      toast.success(`Target set: ${num} conversions for ${currentMonth} ${currentYear}`);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save target.");
    } finally { setSaving(false); }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
          <Target size={20} className="text-amber-600" />
        </div>
        <div>
          <p className="font-extrabold text-gray-800 text-sm">Monthly Target</p>
          <p className="text-xs text-gray-400">{currentMonth} {currentYear}</p>
        </div>
      </div>

      {/* Current target display */}
      {loadingCurrent ? (
        <div className="h-10 bg-gray-100 rounded-xl mb-4 animate-pulse" />
      ) : current ? (
        <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-amber-600 font-semibold uppercase tracking-wide">Current Target</p>
            <p className="text-3xl font-extrabold text-amber-700">{current.globalTarget}
              <span className="text-base font-medium text-amber-500 ml-1.5">conversions</span>
            </p>
          </div>
          <Clock size={28} className="text-amber-300" />
        </div>
      ) : (
        <div className="mb-4 text-xs text-gray-400 italic">No target set for this month yet.</div>
      )}

      {/* Input form */}
      <div className="flex gap-3">
        <input
          type="number"
          min="0"
          value={targetValue}
          onChange={e => setTargetValue(e.target.value)}
          placeholder={`e.g. 10`}
          className="flex-1 text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
        <button
          onClick={handleSave}
          disabled={saving || !targetValue}
          className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-semibold text-sm rounded-xl transition-colors"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <CheckCheck size={14} />}
          {saving ? "Saving…" : current ? "Update" : "Set Target"}
        </button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Dashboard (main)
// ─────────────────────────────────────────────────────────────────────────────
const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [pendingConversions, setPendingConversions] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [timelineModal, setTimelineModal] = useState(null); // { leadId, leadName }

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
      } finally { setLoading(false); }
    };
    fetchAll();
  }, []);

  const cards = [
    { icon: Users, label: "Total Users", value: stats?.totalUsers, color: "bg-brand-600" },
    { icon: UserCheck, label: "Total Customers", value: stats?.totalCustomers, color: "bg-emerald-500" },
    {
      icon: Store, label: "Total Sellers", value: stats?.totalSellers, color: "bg-amber-500",
      badge: pendingConversions, to: "/admin-panel/sellers-performance"
    },
    { icon: Home, label: "Total Sold Apartments", value: stats?.totalSold, color: "bg-rose-500" },
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
        {cards.map((card) => (
          <StatCard key={card.label} {...card} loading={loading} />
        ))}
      </div>

      {/* Bottom two-column layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Idle Leads widget — wide */}
        <div className="xl:col-span-2">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">🔴 Idle Leads Monitor</p>
          <IdleLeadsWidget onViewTimeline={(id, name) => setTimelineModal({ leadId: id, leadName: name })} />
        </div>

        {/* Monthly Target — narrow */}
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
