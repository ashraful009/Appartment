import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  MapPin, Mail, Phone, Building2, InboxIcon, CheckCircle2, Loader2,
} from "lucide-react";

// ── Helpers ───────────────────────────────────────────────────────────────────
const isToday = (dateStr) => {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const today = new Date();
  return (
    d.getFullYear() === today.getFullYear() &&
    d.getMonth()    === today.getMonth()    &&
    d.getDate()     === today.getDate()
  );
};

// ── Reusable Toggle Cell ──────────────────────────────────────────────────────
// statusKey: which field to read ('conversionStatus' or 'sellerConversionStatus')
// endpoint:  API endpoint to call when toggled
// onStatusChange: callback(reqId, newStatus, statusKey)
// approvedLabel: badge text when approved
const StatusToggle = ({ req, statusKey, endpoint, onStatusChange, approvedLabel, approvedColor = "emerald" }) => {
  const [loading, setLoading] = useState(false);
  const status = req[statusKey];

  if (status === "approved") {
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-${approvedColor}-100 text-${approvedColor}-700 text-xs font-semibold`}>
        <CheckCircle2 size={12} />
        {approvedLabel}
      </span>
    );
  }

  if (status === "pending_approval") {
    return (
      <div className="relative group flex items-center gap-2">
        <button disabled className="relative inline-flex w-11 h-6 items-center rounded-full bg-brand-500 opacity-60 cursor-not-allowed">
          <span className="inline-block w-4 h-4 bg-white rounded-full shadow transform translate-x-6" />
        </button>
        <span className="text-xs text-amber-600 font-medium whitespace-nowrap">Pending</span>
        <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-20">
          <div className="bg-gray-800 text-white text-xs rounded-lg px-3 py-1.5 whitespace-nowrap shadow-lg">
            Awaiting admin approval
            <div className="absolute top-full left-4 border-4 border-transparent border-t-gray-800" />
          </div>
        </div>
      </div>
    );
  }

  const handleToggle = async () => {
    setLoading(true);
    try {
      await axios.put(endpoint, {}, { withCredentials: true });
      toast.success("Request sent! Awaiting admin approval.");
      onStatusChange(req._id, "pending_approval", statusKey);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to submit request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2.5">
      {loading ? (
        <Loader2 size={20} className="animate-spin text-brand-500" />
      ) : (
        <button
          onClick={handleToggle}
          className="relative inline-flex w-11 h-6 items-center rounded-full
                     bg-gray-200 hover:bg-gray-300 focus:outline-none
                     focus:ring-2 focus:ring-brand-400 focus:ring-offset-1
                     transition-colors cursor-pointer"
        >
          <span className="inline-block w-4 h-4 bg-white rounded-full shadow transform translate-x-1" />
        </button>
      )}
      {status === "rejected" && (
        <span className="text-xs text-red-500 font-medium">Rejected</span>
      )}
    </div>
  );
};

// ── Table Row ─────────────────────────────────────────────────────────────────
const AssignedRow = ({ req, onStatusChange }) => {
  const { property, user } = req;
  const newToday = isToday(req.assignedAt);

  return (
    <tr className="hover:bg-gray-50/70 transition-colors border-b border-gray-100 last:border-b-0">
      {/* Property */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          {property?.mainImage ? (
            <img src={property.mainImage} alt={property.name}
              className="w-12 h-12 rounded-xl object-cover flex-shrink-0 border border-gray-200" />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-brand-800 flex items-center justify-center flex-shrink-0">
              <Building2 size={20} className="text-white/60" />
            </div>
          )}
          <div className="min-w-0">
            <p className="font-semibold text-gray-800 text-sm truncate max-w-[140px]">{property?.name || "—"}</p>
            <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
              <MapPin size={10} className="text-brand-400" />
              <span className="truncate max-w-[120px]">{property?.address || "—"}</span>
            </p>
          </div>
        </div>
      </td>

      {/* User Name + Today badge */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-xs flex-shrink-0">
            {user?.name?.[0]?.toUpperCase() ?? "?"}
          </div>
          <span className="text-sm font-semibold text-gray-800">{user?.name || "—"}</span>
          {newToday && (
            <span className="inline-flex items-center gap-1 bg-green-500 animate-pulse text-white text-xs px-2 py-0.5 rounded-full font-semibold whitespace-nowrap">
              NEW · Assigned Today
            </span>
          )}
        </div>
      </td>

      {/* Email */}
      <td className="px-5 py-4">
        {user?.email ? (
          <a href={`mailto:${user.email}`} className="flex items-center gap-1.5 text-sm text-brand-600 hover:text-brand-800 font-medium transition-colors">
            <Mail size={13} className="flex-shrink-0" />{user.email}
          </a>
        ) : <span className="text-gray-300 text-sm italic">—</span>}
      </td>

      {/* Phone */}
      <td className="px-5 py-4">
        {user?.phone ? (
          <a href={`tel:${user.phone}`} className="flex items-center gap-1.5 text-sm text-emerald-600 hover:text-emerald-800 font-semibold transition-colors">
            <Phone size={13} className="flex-shrink-0" />{user.phone}
          </a>
        ) : <span className="text-gray-300 text-sm italic">N/A</span>}
      </td>

      {/* Assigned On */}
      <td className="px-5 py-4 text-xs text-gray-400 whitespace-nowrap">
        {req.assignedAt
          ? new Date(req.assignedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
          : "—"}
      </td>

      {/* Accept as Customer */}
      <td className="px-5 py-4">
        <StatusToggle
          req={req}
          statusKey="conversionStatus"
          endpoint={`/api/requests/${req._id}/request-conversion`}
          onStatusChange={onStatusChange}
          approvedLabel="Converted"
          approvedColor="emerald"
        />
      </td>

      {/* Accept as Seller */}
      <td className="px-5 py-4">
        <StatusToggle
          req={req}
          statusKey="sellerConversionStatus"
          endpoint={`/api/requests/${req._id}/request-seller-conversion`}
          onStatusChange={onStatusChange}
          approvedLabel="Seller"
          approvedColor="brand"
        />
      </td>
    </tr>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
const AssignedLeads = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");

  useEffect(() => {
    const fetchAssigned = async () => {
      try {
        const { data } = await axios.get("/api/requests/assigned", { withCredentials: true });
        setRequests(data.requests);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load assigned leads.");
      } finally {
        setLoading(false);
      }
    };
    fetchAssigned();
  }, []);

  // Handle both conversionStatus and sellerConversionStatus updates
  const handleStatusChange = (requestId, newStatus, statusKey) => {
    setRequests((prev) =>
      prev.map((r) => (r._id === requestId ? { ...r, [statusKey]: newStatus } : r))
    );
  };

  const todayCount = requests.filter((r) => isToday(r.assignedAt)).length;

  return (
    <div className="p-8">
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Seller Panel</p>
        <h1 className="text-3xl font-extrabold text-gray-900">My Assigned Leads</h1>
        <p className="text-gray-500 text-sm mt-1">
          Manage your leads. Toggle to request customer or seller conversion approvals.
        </p>
        {!loading && todayCount > 0 && (
          <div className="mt-3 inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm font-semibold px-4 py-2 rounded-xl">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            {todayCount} new lead{todayCount > 1 ? "s" : ""} assigned today!
          </div>
        )}
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>
      )}

      {loading && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-50">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4 animate-pulse">
                <div className="w-12 h-12 bg-gray-200 rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 bg-gray-200 rounded w-1/3" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && requests.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <InboxIcon size={56} className="text-gray-200 mb-4" />
          <p className="text-lg font-semibold text-gray-500">No assigned leads yet</p>
          <p className="text-sm text-gray-400 mt-1">The admin will assign leads to you. Check back soon.</p>
        </div>
      )}

      {!loading && requests.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Property</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600">User Name</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Email</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Phone</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600 whitespace-nowrap">Assigned On</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600 whitespace-nowrap">Accept as Customer</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600 whitespace-nowrap">Accept as Seller</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <AssignedRow key={req._id} req={req} onStatusChange={handleStatusChange} />
                ))}
              </tbody>
            </table>
          </div>
          <p className="px-5 py-3 text-xs text-gray-400 border-t border-gray-100">
            {requests.length} assigned lead{requests.length !== 1 ? "s" : ""}
          </p>
        </div>
      )}
    </div>
  );
};

export default AssignedLeads;
