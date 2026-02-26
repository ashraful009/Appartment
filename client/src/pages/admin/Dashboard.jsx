import React, { useEffect, useState } from "react";
import axios from "axios";
import { Users, UserCheck, Store, Home } from "lucide-react";

const StatCard = ({ icon: Icon, label, value, color, loading }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-5">
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${color}`}>
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

const Dashboard = () => {
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await axios.get("/api/admin/stats", { withCredentials: true });
        setStats(data);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load stats.");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const cards = [
    { icon: Users,     label: "Total Users",         value: stats?.totalUsers,     color: "bg-brand-600" },
    { icon: UserCheck, label: "Total Customers",      value: stats?.totalCustomers, color: "bg-emerald-500" },
    { icon: Store,     label: "Total Sellers",        value: stats?.totalSellers,   color: "bg-amber-500" },
    { icon: Home,      label: "Total Sold Apartments",value: stats?.totalSold,      color: "bg-rose-500" },
  ];

  return (
    <div className="p-8">
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
