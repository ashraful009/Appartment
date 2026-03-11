import React, { useEffect, useState } from "react";
import axios from "axios";
import { InboxIcon } from "lucide-react";
import ClaimedRow from "../../components/seller/claimed/ClaimedRow";

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

  const handleStatusChange = (requestId, newStatus) => {
    setRequests(prev =>
      prev.map(r => (r._id === requestId ? { ...r, conversionStatus: newStatus } : r))
    );
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Seller Panel</p>
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
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600 whitespace-nowrap">Claimed On</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600 whitespace-nowrap">Accept as Customer</th>
                </tr>
              </thead>
              <tbody>
                {requests.map(req => (
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
