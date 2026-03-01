import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  MapPin, Mail, Phone, Building2, InboxIcon, CheckCircle2, Loader2,
} from "lucide-react";

// ── Conversion Toggle Cell ────────────────────────────────────────────────────
const ConversionToggle = ({ req, onStatusChange }) => {
  const [loading, setLoading] = useState(false);
  const { conversionStatus } = req;

  // ✅ Already approved — show static badge
  if (conversionStatus === "approved") {
    return (
      <div className="flex items-center gap-1.5">
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
          <CheckCircle2 size={12} />
          Converted
        </span>
      </div>
    );
  }

  // ⏳ Pending admin approval — toggle ON but disabled with tooltip
  if (conversionStatus === "pending_approval") {
    return (
      <div className="relative group flex items-center gap-2">
        {/* Toggle track — always ON appearance */}
        <button
          disabled
          aria-label="Pending admin approval"
          className="relative inline-flex w-11 h-6 items-center rounded-full
                     bg-brand-500 opacity-60 cursor-not-allowed transition-colors"
        >
          <span className="inline-block w-4 h-4 bg-white rounded-full shadow transform translate-x-6 transition-transform" />
        </button>
        <span className="text-xs text-amber-600 font-medium whitespace-nowrap">
          Pending Approval
        </span>
        {/* Tooltip */}
        <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-20">
          <div className="bg-gray-800 text-white text-xs rounded-lg px-3 py-1.5 whitespace-nowrap shadow-lg">
            Awaiting admin approval
            <div className="absolute top-full left-4 border-4 border-transparent border-t-gray-800" />
          </div>
        </div>
      </div>
    );
  }

  // ❌ Status is 'none' or 'rejected' — show toggle OFF, clickable
  const handleToggle = async () => {
    setLoading(true);
    try {
      await axios.put(
        `/api/requests/${req._id}/request-conversion`,
        {},
        { withCredentials: true }
      );
      toast.success("Conversion request sent! Awaiting admin approval.");
      // Optimistic update — flip status in parent state instantly
      onStatusChange(req._id, "pending_approval");
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to submit conversion request.";
      toast.error(msg);
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
          aria-label="Request conversion to customer"
          className="relative inline-flex w-11 h-6 items-center rounded-full
                     bg-gray-200 hover:bg-gray-300
                     focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-1
                     transition-colors cursor-pointer"
        >
          {/* Thumb — positioned LEFT (OFF) */}
          <span className="inline-block w-4 h-4 bg-white rounded-full shadow transform translate-x-1 transition-transform" />
        </button>
      )}
      {conversionStatus === "rejected" && (
        <span className="text-xs text-red-500 font-medium">Rejected</span>
      )}
    </div>
  );
};

// ── Row component ─────────────────────────────────────────────────────────────
const ClaimedRow = ({ req, onStatusChange }) => {
  const { property, user } = req;
  return (
    <tr className="hover:bg-gray-50/70 transition-colors border-b border-gray-100 last:border-b-0">
      {/* Property */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          {property?.mainImage ? (
            <img
              src={property.mainImage}
              alt={property.name}
              className="w-12 h-12 rounded-xl object-cover flex-shrink-0 border border-gray-200"
            />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-brand-800 flex items-center justify-center flex-shrink-0">
              <Building2 size={20} className="text-white/60" />
            </div>
          )}
          <div className="min-w-0">
            <p className="font-semibold text-gray-800 text-sm truncate max-w-[160px]">
              {property?.name || "—"}
            </p>
            <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
              <MapPin size={10} className="text-brand-400" />
              <span className="truncate max-w-[140px]">{property?.address || "—"}</span>
            </p>
          </div>
        </div>
      </td>

      {/* User Name */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-xs flex-shrink-0">
            {user?.name?.[0]?.toUpperCase() ?? "?"}
          </div>
          <span className="text-sm font-semibold text-gray-800">{user?.name || "—"}</span>
        </div>
      </td>

      {/* Email */}
      <td className="px-5 py-4">
        {user?.email ? (
          <a
            href={`mailto:${user.email}`}
            className="flex items-center gap-1.5 text-sm text-brand-600 hover:text-brand-800 font-medium transition-colors"
          >
            <Mail size={13} className="flex-shrink-0" />
            {user.email}
          </a>
        ) : (
          <span className="text-gray-300 text-sm italic">—</span>
        )}
      </td>

      {/* Phone */}
      <td className="px-5 py-4">
        {user?.phone ? (
          <a
            href={`tel:${user.phone}`}
            className="flex items-center gap-1.5 text-sm text-emerald-600 hover:text-emerald-800 font-semibold transition-colors"
          >
            <Phone size={13} className="flex-shrink-0" />
            {user.phone}
          </a>
        ) : (
          <span className="text-gray-300 text-sm italic">N/A</span>
        )}
      </td>

      {/* Claimed Date */}
      <td className="px-5 py-4 text-xs text-gray-400 whitespace-nowrap">
        {new Date(req.updatedAt).toLocaleDateString("en-GB", {
          day: "2-digit", month: "short", year: "numeric",
        })}
      </td>

      {/* Accept as Customer */}
      <td className="px-5 py-4">
        <ConversionToggle req={req} onStatusChange={onStatusChange} />
      </td>
    </tr>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
const ClaimedUsers = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");

  useEffect(() => {
    const fetchClaimed = async () => {
      try {
        const { data } = await axios.get("/api/requests/claimed", { withCredentials: true });
        setRequests(data.requests);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load claimed leads.");
      } finally {
        setLoading(false);
      }
    };
    fetchClaimed();
  }, []);

  // Optimistic status update — called by ConversionToggle after a successful API call
  const handleStatusChange = (requestId, newStatus) => {
    setRequests((prev) =>
      prev.map((r) => (r._id === requestId ? { ...r, conversionStatus: newStatus } : r))
    );
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">
          Seller Panel
        </p>
        <h1 className="text-3xl font-extrabold text-gray-900">My Claimed Users</h1>
        <p className="text-gray-500 text-sm mt-1">
          Full contact details for leads you have claimed. Toggle "Accept as Customer" to request
          admin approval for conversion.
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Skeleton */}
      {loading && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-50">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4">
                <div className="w-12 h-12 bg-gray-200 rounded-xl animate-pulse flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 bg-gray-200 rounded animate-pulse w-1/3" />
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && requests.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <InboxIcon size={56} className="text-gray-200 mb-4" />
          <p className="text-lg font-semibold text-gray-500">No claimed leads yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Go to "Pending Leads" to claim your first user.
          </p>
        </div>
      )}

      {/* Table */}
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
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600 whitespace-nowrap">
                    Claimed On
                  </th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600 whitespace-nowrap">
                    Accept as Customer
                  </th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <ClaimedRow
                    key={req._id}
                    req={req}
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </tbody>
            </table>
          </div>
          <p className="px-5 py-3 text-xs text-gray-400 border-t border-gray-100">
            {requests.length} claimed lead{requests.length !== 1 ? "s" : ""}
          </p>
        </div>
      )}
    </div>
  );
};

export default ClaimedUsers;
