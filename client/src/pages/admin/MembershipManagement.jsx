import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Eye, AlertCircle, CalendarClock, Save } from "lucide-react";

const fmtTk = (n) => `৳ ${Number(n || 0).toLocaleString("en-BD")}`;

const STATUS_PILL = {
  pending_booking: "bg-amber-50 text-amber-700 border-amber-200",
  member: "bg-rose-50 text-rose-700 border-rose-200",
  investor: "bg-cyan-50 text-cyan-700 border-cyan-200",
  lapsed: "bg-gray-100 text-gray-500 border-gray-200",
};

const STATUS_LABEL = {
  pending_booking: "Pending Booking",
  member: "Member",
  investor: "Investor",
  lapsed: "Lapsed",
};

const FILTERS = [
  { key: "", label: "All" },
  { key: "pending_booking", label: "Pending" },
  { key: "member", label: "Members" },
  { key: "investor", label: "Investors" },
  { key: "lapsed", label: "Lapsed" },
];

const DueDaySettings = () => {
  const [day, setDay] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    axios
      .get("/api/admin/settings/installment-due-day", { withCredentials: true })
      .then(({ data }) => setDay(data.installmentDueDay))
      .catch(() => {});
  }, []);

  const save = async () => {
    const n = Number(day);
    if (!Number.isInteger(n) || n < 1 || n > 31) {
      return toast.error("Due day must be a whole number between 1 and 31.");
    }
    setSaving(true);
    try {
      const { data } = await axios.put(
        "/api/admin/settings/installment-due-day",
        { installmentDueDay: n },
        { withCredentials: true }
      );
      toast.success(data.message || "Due day updated.");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update due day.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-50 flex items-center justify-center">
            <CalendarClock className="text-brand-600" size={20} />
          </div>
          <div>
            <h2 className="font-bold text-gray-800">Installment Due Day</h2>
            <p className="text-xs text-gray-500">
              The day of every month installments are due — applies to all investors.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <input
            type="number"
            min={1}
            max={31}
            value={day}
            onChange={(e) => setDay(e.target.value)}
            className="w-24 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-center focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
          <button
            onClick={save}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 text-white text-sm font-bold rounded-xl hover:bg-brand-700 disabled:opacity-60"
          >
            <Save size={15} /> Save
          </button>
        </div>
      </div>
    </div>
  );
};

const MembershipManagement = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRows = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(
          `/api/admin/memberships${filter ? `?status=${filter}` : ""}`,
          { withCredentials: true }
        );
        setRows(data);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load memberships.");
      } finally {
        setLoading(false);
      }
    };
    fetchRows();
  }, [filter]);

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-800">Memberships & Investors</h1>
        <p className="text-gray-500 text-sm mt-1">
          Review booking, down payment, and installment submissions.
        </p>
      </div>

      <DueDaySettings />

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-5">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
              filter === f.key
                ? "bg-brand-600 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-5 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          <AlertCircle size={15} /> {error}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {["User", "Status", "Shares", "Invested", "In Pipeline", "Actions"].map((c) => (
                  <th
                    key={c}
                    className="text-left px-5 py-3.5 font-semibold text-gray-600 whitespace-nowrap"
                  >
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="px-5 py-4">
                      <div className="h-8 bg-gray-100 rounded-lg animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-14 text-gray-400">
                    No memberships found.
                  </td>
                </tr>
              ) : (
                rows.map((m) => (
                  <tr key={m._id} className="hover:bg-gray-50/70">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-gray-800">{m.userId?.name}</p>
                      <p className="text-xs text-gray-400">{m.userId?.email}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`px-2.5 py-1 text-[11px] font-semibold rounded-full border ${
                          STATUS_PILL[m.status]
                        }`}
                      >
                        {STATUS_LABEL[m.status] || m.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-bold text-gray-800">{m.shares}</td>
                    <td className="px-5 py-4 text-gray-600">{fmtTk(m.totalApprovedPaid)}</td>
                    <td className="px-5 py-4">
                      {m.inProgressCount > 0 ? (
                        <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-amber-100 text-amber-700">
                          {m.inProgressCount} in pipeline
                        </span>
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <Link
                        to={`/admin-panel/memberships/${m.userId?._id}`}
                        className="inline-flex items-center gap-1.5 text-brand-600 hover:text-brand-800 text-sm font-medium bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-lg"
                      >
                        <Eye size={14} /> View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MembershipManagement;
