import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { FileText, Heart, CalendarDays } from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import WelcomeHeader from "../../components/customer/dashboard/WelcomeHeader";
import CustomerStatCard from "../../components/customer/dashboard/CustomerStatCard";
import NextActionBanner from "../../components/customer/dashboard/NextActionBanner";

// ── Skeleton loader for stat cards ───────────────────────────────────────────
const StatCardSkeleton = () => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-5 animate-pulse">
    <div className="w-14 h-14 rounded-2xl bg-gray-200 flex-shrink-0" />
    <div className="flex-1">
      <div className="h-3 w-24 bg-gray-200 rounded mb-3" />
      <div className="h-8 w-14 bg-gray-200 rounded-lg" />
    </div>
  </div>
);

// ── Stat card config ──────────────────────────────────────────────────────────
const buildCards = (data) => [
  {
    id: "active-requests",
    title: "Active Requests",
    value: data?.activeRequestsCount ?? 0,
    icon: FileText,
    colorClass: "bg-brand-600",
  },
  {
    id: "saved-properties",
    title: "Saved Properties",
    value: data?.savedPropertiesCount ?? 0,
    icon: Heart,
    colorClass: "bg-rose-500",
  },
  {
    id: "upcoming-meetings",
    title: "Upcoming Meetings",
    // Derive count: 1 if a meeting is scheduled, 0 otherwise.
    // The overview API returns the *next* single meeting; use its presence
    // as a boolean count. Extend this if a dedicated count endpoint is added.
    value: data?.upcomingMeeting ? 1 : 0,
    icon: CalendarDays,
    colorClass: "bg-indigo-500",
  },
];

// ── Main Component ────────────────────────────────────────────────────────────
const CustomerDashboard = () => {
  const { user } = useAuth();

  const [overviewData, setOverviewData] = useState(null);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const { data } = await axios.get("/api/customer/overview", {
          withCredentials: true,
        });
        if (data.success) {
          setOverviewData(data.data);
        }
      } catch (err) {
        const msg =
          err?.response?.data?.message || "Failed to load dashboard data.";
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, []);

  const cards = buildCards(overviewData);

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      {/* ── Welcome Header ────────────────────────────────────────────── */}
      <WelcomeHeader userName={user?.name} />

      {/* ── Next Meeting Banner (only rendered if a meeting exists) ──── */}
      {!loading && (
        <NextActionBanner meeting={overviewData?.upcomingMeeting} />
      )}

      {/* ── Banner skeleton while loading ────────────────────────────── */}
      {loading && (
        <div className="mb-8 h-[88px] rounded-2xl bg-gray-100 animate-pulse" />
      )}

      {/* ── Stat Cards Grid ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
              <StatCardSkeleton key={i} />
            ))
          : cards.map((card) => (
              <CustomerStatCard
                key={card.id}
                title={card.title}
                value={card.value}
                icon={card.icon}
                colorClass={card.colorClass}
                loading={false}
              />
            ))}
      </div>
    </div>
  );
};

export default CustomerDashboard;
