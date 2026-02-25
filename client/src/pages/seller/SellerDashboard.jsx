import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import {
  Users, UserCheck, ArrowRight, Copy, CheckCheck, QrCode,
} from "lucide-react";

// ── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, color, loading }) => (
  <div className="relative overflow-hidden bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-5">
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${color}`}>
      <Icon size={26} className="text-white" />
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500 mb-0.5">{label}</p>
      {loading ? (
        <div className="h-8 w-16 bg-gray-200 animate-pulse rounded-lg" />
      ) : (
        <p className="text-3xl font-extrabold text-gray-900">{value ?? 0}</p>
      )}
    </div>
    <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10 ${color}`} />
  </div>
);

// ── Referral Code Card ────────────────────────────────────────────────────────
const ReferralCodeCard = ({ userId }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(userId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback for older browsers
      const el = document.createElement("textarea");
      el.value = userId;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 mb-8 shadow-lg relative overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-amber-500/10" />
      <div className="absolute -right-2 -top-8 w-24 h-24 rounded-full bg-amber-500/5" />

      <div className="relative">
        {/* Header */}
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center">
            <QrCode size={18} className="text-amber-400" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-amber-400">Share This</p>
            <p className="text-base font-extrabold text-white leading-tight">My Referral Code</p>
          </div>
        </div>

        <p className="text-xs text-gray-400 mb-3 leading-relaxed">
          Share your unique ID with customers. When they register using your code and request a property, the lead is automatically assigned to you.
        </p>

        {/* Code box + copy button */}
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-gray-950/60 border border-gray-700 rounded-xl px-4 py-3 min-w-0">
            <p className="font-mono text-sm text-amber-300 truncate select-all tracking-wide">
              {userId}
            </p>
          </div>
          <button
            onClick={handleCopy}
            className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
              copied
                ? "bg-emerald-500 text-white"
                : "bg-amber-500 hover:bg-amber-400 text-gray-900"
            }`}
          >
            {copied ? (
              <><CheckCheck size={15} /> Copied!</>
            ) : (
              <><Copy size={15} /> Copy</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main ──────────────────────────────────────────────────────────────────────
const SellerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await axios.get("/api/requests/stats");
        setStats(data);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load stats.");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Seller Panel</p>
        <h1 className="text-3xl font-extrabold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          Overview of incoming leads and your claimed contacts.
        </p>
      </div>

      {/* ── Referral Code Card ─────────────────────────────────────────────── */}
      {user?._id && <ReferralCodeCard userId={user._id} />}

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
        <StatCard
          icon={Users}
          label="Pending User Requests"
          value={stats?.pendingCount}
          color="bg-amber-500"
          loading={loading}
        />
        <StatCard
          icon={UserCheck}
          label="My Claimed Users"
          value={stats?.myClaimedCount}
          color="bg-brand-600"
          loading={loading}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          to="/seller-panel/pending"
          className="group flex items-center justify-between bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-2xl px-6 py-5 transition-colors"
        >
          <div>
            <p className="font-bold text-amber-800">View Pending Leads</p>
            <p className="text-sm text-amber-600 mt-0.5">Claim new user requests</p>
          </div>
          <ArrowRight size={20} className="text-amber-600 group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link
          to="/seller-panel/claimed"
          className="group flex items-center justify-between bg-brand-50 hover:bg-brand-100 border border-brand-200 rounded-2xl px-6 py-5 transition-colors"
        >
          <div>
            <p className="font-bold text-brand-800">View My Claimed Users</p>
            <p className="text-sm text-brand-600 mt-0.5">Contact your leads</p>
          </div>
          <ArrowRight size={20} className="text-brand-600 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
};

export default SellerDashboard;
