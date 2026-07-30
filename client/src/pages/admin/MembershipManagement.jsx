import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Eye, AlertCircle, CalendarClock, Save, Plus, Building2, X } from "lucide-react";

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


const CreateBookingModal = ({ onClose, onCreated }) => {
  const [users, setUsers] = useState([]);
  const [properties, setProperties] = useState([]);
  const [userId, setUserId] = useState("");
  const [propertyId, setPropertyId] = useState("");
  const [autoApprove, setAutoApprove] = useState(false);
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    Promise.all([
      axios.get("/api/admin/users", { withCredentials: true }),
      axios.get("/api/admin/memberships/properties-list", { withCredentials: true }),
    ]).then(([usersRes, propsRes]) => {
      setUsers(usersRes.data.users || []);
      setProperties(propsRes.data.properties || []);
    });
  }, []);

  const filteredUsers = users.filter(
    (u) =>
      !search ||
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.phone?.includes(search) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async () => {
    if (!userId) return toast.error("Select a user.");
    if (!propertyId) return toast.error("Select a property.");
    setCreating(true);
    try {
      const { data } = await axios.post(
        "/api/admin/memberships",
        { userId, propertyId, autoApprove },
        { withCredentials: true }
      );
      toast.success(data.message || "Membership created.");
      onCreated();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create membership.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-gray-900">Create Booking</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">User</label>
          <input
            type="text"
            placeholder="Search by name, phone, or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm mb-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
          <select
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          >
            <option value="">Select user…</option>
            {filteredUsers.slice(0, 50).map((u) => (
              <option key={u._id} value={u._id}>
                {u.name} ({u.phone || u.email})
              </option>
            ))}
          </select>
        </div>

        
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">Property</label>
          <select
            value={propertyId}
            onChange={(e) => setPropertyId(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          >
            <option value="">Select property…</option>
            {properties.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name} — {p.address} ({p.status})
              </option>
            ))}
          </select>
        </div>

        
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={autoApprove}
            onChange={(e) => setAutoApprove(e.target.checked)}
            className="w-4 h-4 accent-brand-600"
          />
          Auto-approve (skip staff pipeline)
        </label>

        <button
          onClick={handleCreate}
          disabled={creating}
          className="w-full py-2.5 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 disabled:opacity-60"
        >
          {creating ? "Creating…" : "Create Booking"}
        </button>
      </div>
    </div>
  );
};


const MembershipManagement = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [propertyFilter, setPropertyFilter] = useState("");
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [properties, setProperties] = useState([]);

  const fetchRows = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter) params.set("status", filter);
      if (propertyFilter) params.set("propertyId", propertyFilter);
      const qs = params.toString();
      const { data } = await axios.get(
        `/api/admin/memberships${qs ? `?${qs}` : ""}`,
        { withCredentials: true }
      );
      setRows(data);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load memberships.");
    } finally {
      setLoading(false);
    }
  }, [filter, propertyFilter]);

  useEffect(() => {
    fetchRows();
  }, [fetchRows]);

  
  useEffect(() => {
    axios
      .get("/api/admin/memberships/properties-list", { withCredentials: true })
      .then(({ data }) => setProperties(data.properties || []))
      .catch(() => {});
  }, []);

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-end">
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white text-sm font-bold rounded-xl hover:bg-brand-700"
        >
          <Plus size={16} /> Create Booking
      </div>

      {showCreate && (
        <CreateBookingModal
          onClose={() => setShowCreate(false)}
          onCreated={fetchRows}
        />
      )}

      <DueDaySettings />

      
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="flex flex-wrap gap-2">
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
        <div className="ml-auto">
          <select
            value={propertyFilter}
            onChange={(e) => setPropertyFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          >
            <option value="">All Properties</option>
            {properties.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
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
                {["User", "Property", "Status", "Shares", "Invested", "In Pipeline", "Actions"].map((c) => (
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
                    <td colSpan={7} className="px-5 py-4">
                      <div className="h-8 bg-gray-100 rounded-lg animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-14 text-gray-400">
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
                      <div className="flex items-center gap-2">
                        {m.propertyId?.mainImage ? (
                          <img
                            src={m.propertyId.mainImage}
                            alt={m.propertyId.name}
                            className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                            <Building2 size={14} className="text-gray-300" />
                          </div>
                        )}
                        <span className="text-sm font-medium text-gray-700 truncate max-w-[140px]">
                          {m.propertyId?.name || "—"}
                        </span>
                      </div>
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
                        to={`/admin-panel/memberships/${m._id}`}
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
