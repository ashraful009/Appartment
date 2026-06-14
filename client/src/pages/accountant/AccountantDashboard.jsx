import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { ClipboardCheck, Users, AlertTriangle, ArrowRight } from "lucide-react";

const StatCard = ({ icon: Icon, label, value, to, accent }) => (
  <Link
    to={to}
    className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow flex items-center gap-4"
  >
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${accent}`}>
      <Icon size={22} />
    </div>
    <div className="flex-1">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-extrabold text-gray-900">{value}</p>
    </div>
    <ArrowRight size={18} className="text-gray-300" />
  </Link>
);

const AccountantDashboard = () => {
  const [pending, setPending] = useState(null);
  const [members, setMembers] = useState([]);

  useEffect(() => {
    axios
      .get("/api/accountant/pending", { withCredentials: true })
      .then(({ data }) => setPending(data.length))
      .catch(() => setPending(0));
    axios
      .get("/api/accountant/members", { withCredentials: true })
      .then(({ data }) => setMembers(data))
      .catch(() => setMembers([]));
  }, []);

  const overdueMembers = members.filter((m) => m.overdueCount > 0).length;

  return (
    <div className="p-6 md:p-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900">Accountant Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          Confirm payments and keep an eye on members' installment timing.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={ClipboardCheck}
          label="Pending Confirmations"
          value={pending ?? "—"}
          to="/accountant/pending"
          accent="bg-amber-50 text-amber-600"
        />
        <StatCard
          icon={Users}
          label="Members"
          value={members.length}
          to="/accountant/members"
          accent="bg-brand-50 text-brand-600"
        />
        <StatCard
          icon={AlertTriangle}
          label="Overdue Members"
          value={overdueMembers}
          to="/accountant/members"
          accent="bg-red-50 text-red-600"
        />
      </div>
    </div>
  );
};

export default AccountantDashboard;
