import React, { useEffect, useState } from "react";
import axios from "axios";
import { MapPin, User, Loader2, CheckCircle, AlertCircle, Building2, InboxIcon } from "lucide-react";

// ── Toast ─────────────────────────────────────────────────────────────────────
const useToast = () => {
  const [toast, setToast] = useState(null);
  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };
  return { toast, showToast };
};

// ── Request Card ──────────────────────────────────────────────────────────────
const RequestCard = ({ req, onClaim, claiming }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
    {/* Property thumbnail */}
    <div className="h-40 bg-gray-100 flex-shrink-0 relative overflow-hidden">
      {req.property?.mainImage ? (
        <img
          src={req.property.mainImage}
          alt={req.property.name}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-brand-600 to-brand-900 flex items-center justify-center">
          <Building2 size={40} className="text-white/30" />
        </div>
      )}
    </div>

    {/* Card Body */}
    <div className="p-5 flex flex-col flex-1">
      {/* Property info */}
      <h3 className="font-bold text-gray-900 text-base leading-tight line-clamp-1">
        {req.property?.name || "Unknown Property"}
      </h3>
      <p className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
        <MapPin size={12} className="text-brand-500 flex-shrink-0" />
        <span className="line-clamp-1">{req.property?.address || "—"}</span>
      </p>

      {/* Divider */}
      <div className="my-3 border-t border-gray-100" />

      {/* Requester info */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-xs flex-shrink-0">
          {req.user?.name?.[0]?.toUpperCase() ?? "?"}
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-800">{req.user?.name || "Anonymous"}</p>
          <p className="text-xs text-gray-400">Requested pricing</p>
        </div>
      </div>

      {/* Claim Button */}
      <button
        onClick={() => onClaim(req._id)}
        disabled={claiming}
        className="mt-auto w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-bold uppercase tracking-wide transition-colors flex items-center justify-center gap-2"
      >
        {claiming ? (
          <><Loader2 size={14} className="animate-spin" /> Claiming…</>
        ) : (
          "Claim User"
        )}
      </button>
    </div>
  </div>
);

// ── Main ──────────────────────────────────────────────────────────────────────
const PendingRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [claimingId, setClaimingId] = useState(null);
  const { toast, showToast } = useToast();

  useEffect(() => {
    const fetchPending = async () => {
      try {
        const { data } = await axios.get("/api/requests/pending");
        setRequests(data.requests);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load requests.");
      } finally {
        setLoading(false);
      }
    };
    fetchPending();
  }, []);

  const handleClaim = async (requestId) => {
    if (claimingId) return;
    setClaimingId(requestId);
    try {
      await axios.put(`/api/requests/${requestId}/claim`);
      // Remove the claimed card from local state immediately
      setRequests((prev) => prev.filter((r) => r._id !== requestId));
      showToast("success", "Lead claimed! Check 'My Claimed Users' to contact them.");
    } catch (err) {
      showToast("error", err?.response?.data?.message || "Failed to claim lead.");
    } finally {
      setClaimingId(null);
    }
  };

  return (
    <div className="p-8">
      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-start gap-3 px-5 py-4 rounded-2xl shadow-xl text-sm font-medium max-w-sm ${
          toast.type === "success"
            ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
            : "bg-red-50 border border-red-200 text-red-700"
        }`}>
          {toast.type === "success"
            ? <CheckCircle size={18} className="flex-shrink-0 mt-0.5" />
            : <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />}
          <span className="flex-1">{toast.msg}</span>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Seller Panel</p>
        <h1 className="text-3xl font-extrabold text-gray-900">Pending Leads</h1>
        <p className="text-gray-500 text-sm mt-1">
          {requests.length > 0 ? `${requests.length} unassigned request${requests.length > 1 ? "s" : ""} — claim one to unlock contact info.` : "No pending requests right now."}
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>
      )}

      {/* Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="h-40 bg-gray-200 animate-pulse" />
              <div className="p-5 space-y-3">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
                <div className="h-10 bg-gray-200 rounded-xl animate-pulse mt-4" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && requests.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <InboxIcon size={56} className="text-gray-200 mb-4" />
          <p className="text-lg font-semibold text-gray-500">No pending leads right now</p>
          <p className="text-sm text-gray-400 mt-1">Check back later — new requests will appear here.</p>
        </div>
      )}

      {/* Card Grid */}
      {!loading && requests.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {requests.map((req) => (
            <RequestCard
              key={req._id}
              req={req}
              onClaim={handleClaim}
              claiming={claimingId === req._id}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingRequests;
