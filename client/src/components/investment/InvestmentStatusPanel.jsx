import React from "react";
import { ShieldCheck, PieChart, Wallet, TrendingUp, Clock } from "lucide-react";
import { fmtTk, daysUntil } from "./fmt";

const ROLE_LABEL = {
  pending_booking: "Pending Booking",
  member: "Member",
  investor: "Investor",
  lapsed: "Lapsed",
};

const StatCard = ({ icon: Icon, label, value, sub }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
    <div className="flex items-center gap-2 text-gray-500 mb-2">
      <Icon size={16} className="text-brand-500" />
      <span className="text-xs font-semibold uppercase tracking-wide">{label}</span>
    </div>
    <p className="text-2xl font-extrabold text-gray-900">{value}</p>
    {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
  </div>
);

const InvestmentStatusPanel = ({ membership, summary }) => {
  if (!membership) return null;

  const pct = Math.min(
    100,
    Math.round((membership.totalApprovedPaid / membership.totalTarget) * 100)
  );

  const deadlineDays =
    membership.status === "member" ? daysUntil(membership.memberDeadline) : null;

  return (
    <div className="space-y-5">
      {/* Progress toward 50 lakh */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-700">
            Progress to {fmtTk(membership.totalTarget)}
          </span>
          <span className="text-sm font-bold text-brand-700">{pct}%</span>
        </div>
        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-600 rounded-full transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-2">
          {fmtTk(membership.totalApprovedPaid)} invested so far
        </p>
      </div>

      {/* Stat grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={ShieldCheck}
          label="Role"
          value={ROLE_LABEL[membership.status] || membership.status}
        />
        <StatCard
          icon={PieChart}
          label="Shares"
          value={membership.shares}
          sub="1 share / ৳1,00,000"
        />
        <StatCard
          icon={Wallet}
          label="Total Investment"
          value={fmtTk(membership.totalApprovedPaid)}
          sub="Approved"
        />
        <StatCard
          icon={TrendingUp}
          label="Installments"
          value={summary ? fmtTk(summary.installmentsProvided) : "—"}
          sub={summary ? `${fmtTk(summary.installmentsDue)} due` : ""}
        />
      </div>

      {/* Deadline banner for members */}
      {membership.status === "member" && deadlineDays != null && (
        <div
          className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm ${
            deadlineDays < 30
              ? "bg-red-50 border border-red-200 text-red-700"
              : "bg-amber-50 border border-amber-200 text-amber-700"
          }`}
        >
          <Clock size={16} />
          {deadlineDays >= 0 ? (
            <span>
              <strong>{deadlineDays} day(s)</strong> left to complete your down payment
              and become an investor.
            </span>
          ) : (
            <span>Your membership window has expired.</span>
          )}
        </div>
      )}
    </div>
  );
};

export default InvestmentStatusPanel;
