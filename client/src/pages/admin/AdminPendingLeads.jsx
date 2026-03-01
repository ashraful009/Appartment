import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Building2, MapPin, Phone, User2, Users2,
  Loader2, InboxIcon, ChevronRight, AlertCircle,
} from "lucide-react";

// ── Property thumbnail cell ───────────────────────────────────────────────────
const PropertyCell = ({ property }) => (
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
      <p className="font-semibold text-gray-800 text-sm truncate max-w-[180px]">
        {property?.name || "—"}
      </p>
      <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
        <MapPin size={10} className="text-brand-400 flex-shrink-0" />
        <span className="truncate max-w-[160px]">{property?.address || "—"}</span>
      </p>
    </div>
  </div>
);

// ── User cell ─────────────────────────────────────────────────────────────────
const UserCell = ({ user }) => (
  <div className="flex items-center gap-2.5">
    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center flex-shrink-0">
      {user?.name?.[0]?.toUpperCase() ?? "?"}
    </div>
    <div>
      <p className="text-sm font-semibold text-gray-800">{user?.name || "—"}</p>
      {user?.phone && (
        <a href={`tel:${user.phone}`} className="flex items-center gap-1 text-xs text-emerald-600 hover:underline">
          <Phone size={10} />{user.phone}
        </a>
      )}
    </div>
  </div>
);

// ── Assignment Row ────────────────────────────────────────────────────────────
const LeadRow = ({ req, sellers, onAssigned }) => {
  const [selectedSeller, setSelectedSeller] = useState("");
  const [assigning, setAssigning]           = useState(false);

  const handleAssign = async () => {
    if (!selectedSeller) {
      toast.error("Please select a seller before assigning.");
      return;
    }
    setAssigning(true);
    try {
      await axios.put(
        `/api/admin/requests/${req._id}/assign`,
        { sellerId: selectedSeller },
        { withCredentials: true }
      );
      toast.success("Lead assigned successfully!");
      onAssigned(req._id); // remove from local list
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to assign lead.");
    } finally {
      setAssigning(false);
    }
  };

  return (
    <tr className="hover:bg-gray-50/70 transition-colors border-b border-gray-100 last:border-0">
      {/* Property */}
      <td className="px-5 py-4">
        <PropertyCell property={req.property} />
      </td>

      {/* User */}
      <td className="px-5 py-4">
        <UserCell user={req.user} />
      </td>

      {/* Requested on */}
      <td className="px-5 py-4 text-xs text-gray-400 whitespace-nowrap">
        {new Date(req.createdAt).toLocaleDateString("en-GB", {
          day: "2-digit", month: "short", year: "numeric",
        })}
      </td>

      {/* Assign To dropdown */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-2">
          <select
            value={selectedSeller}
            onChange={(e) => setSelectedSeller(e.target.value)}
            disabled={assigning}
            className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white text-gray-700
                       focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent
                       hover:border-gray-300 transition-colors disabled:opacity-50 min-w-[220px]"
          >
            <option value="">— Select a seller —</option>
            {sellers.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name} (Active Leads: {s.currentLeadCount})
              </option>
            ))}
          </select>

          <button
            onClick={handleAssign}
            disabled={assigning || !selectedSeller}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold
                       bg-brand-600 text-white hover:bg-brand-700 transition-all shadow-sm
                       disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {assigning
              ? <><Loader2 size={13} className="animate-spin" /> Assigning…</>
              : <><ChevronRight size={13} /> Assign</>
            }
          </button>
        </div>
      </td>
    </tr>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const AdminPendingLeads = () => {
  const [leads,   setLeads]   = useState([]);
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [leadsRes, sellersRes] = await Promise.all([
          axios.get("/api/admin/requests/pending",  { withCredentials: true }),
          axios.get("/api/admin/sellers-list",       { withCredentials: true }),
        ]);
        setLeads(leadsRes.data.requests);
        setSellers(sellersRes.data.sellers);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load data.");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // Optimistically remove assigned lead from the table
  const handleAssigned = (requestId) => {
    setLeads((prev) => prev.filter((r) => r._id !== requestId));
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">
          Admin Panel
        </p>
        <h1 className="text-3xl font-extrabold text-gray-900">Pending Leads</h1>
        <p className="text-gray-500 text-sm mt-1">
          Assign incoming price requests to the right seller.
        </p>
      </div>

      {/* Summary strip */}
      {!loading && !error && (
        <div className="flex items-center gap-6 mb-6">
          <div className="flex items-center gap-2 bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-3">
            <InboxIcon size={18} className="text-brand-500" />
            <span className="text-sm font-bold text-gray-800">{leads.length}</span>
            <span className="text-sm text-gray-400">unassigned lead{leads.length !== 1 ? "s" : ""}</span>
          </div>
          <div className="flex items-center gap-2 bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-3">
            <Users2 size={18} className="text-emerald-500" />
            <span className="text-sm font-bold text-gray-800">{sellers.length}</span>
            <span className="text-sm text-gray-400">available seller{sellers.length !== 1 ? "s" : ""}</span>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm flex items-center gap-2">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Skeleton */}
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
                <div className="h-9 bg-gray-200 rounded-xl w-48" />
                <div className="h-9 bg-gray-300 rounded-xl w-24" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && leads.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center mb-4">
            <User2 size={32} className="text-emerald-500" />
          </div>
          <p className="text-lg font-semibold text-gray-500">All leads assigned!</p>
          <p className="text-sm text-gray-400 mt-1">
            No pending price requests right now. Check back later.
          </p>
        </div>
      )}

      {/* Table */}
      {!loading && leads.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Property</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Requested By</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600 whitespace-nowrap">Requested On</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Assign To Seller</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((req) => (
                  <LeadRow
                    key={req._id}
                    req={req}
                    sellers={sellers}
                    onAssigned={handleAssigned}
                  />
                ))}
              </tbody>
            </table>
          </div>
          <p className="px-5 py-3 text-xs text-gray-400 border-t border-gray-100">
            {leads.length} pending lead{leads.length !== 1 ? "s" : ""} awaiting assignment
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminPendingLeads;
