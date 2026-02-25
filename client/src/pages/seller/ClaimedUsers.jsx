import React, { useEffect, useState } from "react";
import axios from "axios";
import { MapPin, Mail, Phone, Building2, InboxIcon } from "lucide-react";

// ── Row component ─────────────────────────────────────────────────────────────
const ClaimedRow = ({ req }) => {
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

      {/* User name */}
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

      {/* Claimed date */}
      <td className="px-5 py-4 text-xs text-gray-400 whitespace-nowrap">
        {new Date(req.updatedAt).toLocaleDateString("en-GB", {
          day: "2-digit", month: "short", year: "numeric",
        })}
      </td>
    </tr>
  );
};

// ── Main ──────────────────────────────────────────────────────────────────────
const ClaimedUsers = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");

  useEffect(() => {
    const fetchClaimed = async () => {
      try {
        const { data } = await axios.get("/api/requests/claimed");
        setRequests(data.requests);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load claimed leads.");
      } finally {
        setLoading(false);
      }
    };
    fetchClaimed();
  }, []);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Seller Panel</p>
        <h1 className="text-3xl font-extrabold text-gray-900">My Claimed Users</h1>
        <p className="text-gray-500 text-sm mt-1">
          Full contact details for leads you have claimed. Reach out to close the deal.
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>
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

      {/* Empty */}
      {!loading && requests.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <InboxIcon size={56} className="text-gray-200 mb-4" />
          <p className="text-lg font-semibold text-gray-500">No claimed leads yet</p>
          <p className="text-sm text-gray-400 mt-1">Go to "Pending Leads" to claim your first user.</p>
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
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600 whitespace-nowrap">Claimed On</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <ClaimedRow key={req._id} req={req} />
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
