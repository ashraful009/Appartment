import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  ChevronDown, ChevronUp, CheckCircle2, XCircle,
  Mail, Phone, User2, Building2, Loader2, InboxIcon,
  TrendingUp, Clock, Store, UserCheck,
} from "lucide-react";

// ── Helpers ───────────────────────────────────────────────────────────────────
const Avatar = ({ name, size = "md" }) => {
  const sizes = { sm: "w-7 h-7 text-xs", md: "w-9 h-9 text-sm" };
  return (
    <div className={`${sizes[size]} rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center flex-shrink-0`}>
      {name?.[0]?.toUpperCase() ?? "?"}
    </div>
  );
};

// ── Determine request type ────────────────────────────────────────────────────
// A request can have BOTH pendingCustomer and pendingSeller simultaneously.
// We show a card for each pending status separately.
const getRequestType = (request) => {
  const types = [];
  if (request.conversionStatus       === "pending_approval") types.push("customer");
  if (request.sellerConversionStatus === "pending_approval") types.push("seller");
  return types;
};

// ── Type Badge ────────────────────────────────────────────────────────────────
const TypeBadge = ({ type }) =>
  type === "seller" ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-100 text-brand-700 text-xs font-bold border border-brand-200">
      <Store size={10} /> Seller Request
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200">
      <UserCheck size={10} /> Customer Request
    </span>
  );

// ── Pending User Card ─────────────────────────────────────────────────────────
// type: 'customer' | 'seller'
const PendingUserCard = ({ request, type, sellerId, onAction }) => {
  const [accepting, setAccepting] = useState(false);
  const [rejecting, setRejecting] = useState(false);

  const approveEndpoint = type === "seller"
    ? `/api/admin/requests/${request._id}/approve-seller-conversion`
    : `/api/admin/requests/${request._id}/approve-conversion`;

  const rejectEndpoint = type === "seller"
    // For seller rejection we reuse the same reject endpoint with a query flag,
    // OR just update sellerConversionStatus. We use a dedicated route:
    ? `/api/admin/requests/${request._id}/reject-seller-conversion`
    : `/api/admin/requests/${request._id}/reject-conversion`;

  const handleAction = async (actionType) => {
    const setter     = actionType === "approve" ? setAccepting : setRejecting;
    const endpoint   = actionType === "approve" ? approveEndpoint : rejectEndpoint;
    const successMsg = actionType === "approve"
      ? type === "seller"
        ? `✅ ${request.user?.name} has been promoted to Seller!`
        : `✅ ${request.user?.name} has been converted to a Customer!`
      : `❌ ${type === "seller" ? "Seller" : "Conversion"} request rejected.`;

    setter(true);
    try {
      await axios.put(endpoint, {}, { withCredentials: true });
      toast.success(successMsg);
      onAction(sellerId, request._id, type, actionType === "approve" ? "approved" : "rejected");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Action failed. Please try again.");
    } finally {
      setter(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-amber-50/60 border border-amber-100 rounded-xl">
      {/* User Info */}
      <div className="flex items-start gap-3 min-w-0">
        <Avatar name={request.user?.name} size="md" />
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <p className="font-semibold text-gray-800 text-sm">{request.user?.name || "—"}</p>
            <TypeBadge type={type} />
          </div>
          {request.user?.email && (
            <a href={`mailto:${request.user.email}`} className="flex items-center gap-1 text-xs text-brand-600 hover:underline mt-0.5">
              <Mail size={11} />{request.user.email}
            </a>
          )}
          {request.user?.phone && (
            <a href={`tel:${request.user.phone}`} className="flex items-center gap-1 text-xs text-emerald-600 hover:underline mt-0.5">
              <Phone size={11} />{request.user.phone}
            </a>
          )}
          {request.property?.name && (
            <p className="flex items-center gap-1 text-xs text-gray-400 mt-1">
              <Building2 size={11} />
              <span className="truncate">{request.property.name}</span>
            </p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={() => handleAction("reject")}
          disabled={accepting || rejecting}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold
                     bg-red-50 text-red-600 border border-red-200
                     hover:bg-red-100 hover:border-red-300 transition-all
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {rejecting ? <Loader2 size={13} className="animate-spin" /> : <XCircle size={13} />}
          {rejecting ? "Rejecting…" : "Reject"}
        </button>

        <button
          onClick={() => handleAction("approve")}
          disabled={accepting || rejecting}
          className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold
                     shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed
                     ${type === "seller"
                       ? "bg-brand-600 text-white border border-brand-700 hover:bg-brand-700"
                       : "bg-emerald-500 text-white border border-emerald-600 hover:bg-emerald-600"
                     }`}
        >
          {accepting ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
          {accepting ? "Approving…" : type === "seller" ? "Make Seller" : "Accept"}
        </button>
      </div>
    </div>
  );
};

// ── Build the flat list of pending cards for each seller ──────────────────────
// Each request may appear twice if both conversionStatus AND sellerConversionStatus are pending.
const buildPendingCards = (pendingRequests) => {
  const cards = [];
  pendingRequests.forEach((req) => {
    const types = getRequestType(req);
    types.forEach((type) => cards.push({ req, type }));
  });
  return cards;
};

// ── Seller Row (accordion) ────────────────────────────────────────────────────
const SellerRow = ({ sellerData, onAction }) => {
  const [open, setOpen] = useState(false);
  const { seller, approvedCount, pendingCount, pendingRequests } = sellerData;

  const pendingCards = buildPendingCards(pendingRequests ?? []);
  const hasPending = pendingCards.length > 0;

  return (
    <div className="rounded-2xl border bg-white shadow-sm overflow-hidden transition-all">
      {/* Header row */}
      <div
        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 ${hasPending ? "cursor-pointer hover:bg-gray-50/70 transition-colors" : ""}`}
        onClick={() => hasPending && setOpen((o) => !o)}
      >
        {/* Seller identity */}
        <div className="flex items-center gap-3 min-w-0">
          <Avatar name={seller?.name} size="md" />
          <div className="min-w-0">
            <p className="font-bold text-gray-800 text-sm truncate">{seller?.name || "Unknown Seller"}</p>
            {seller?.email && (
              <a href={`mailto:${seller.email}`} onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1 text-xs text-brand-600 hover:underline mt-0.5">
                <Mail size={11} /> {seller.email}
              </a>
            )}
            {seller?.phone && (
              <a href={`tel:${seller.phone}`} onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1 text-xs text-emerald-600 hover:underline">
                <Phone size={11} /> {seller.phone}
              </a>
            )}
          </div>
        </div>

        {/* Stats badges */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-100">
            <TrendingUp size={13} className="text-emerald-500" />
            <span className="text-xs font-bold text-emerald-700">{approvedCount}</span>
            <span className="text-xs text-emerald-500">converted</span>
          </div>

          {hasPending ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200">
              <Clock size={13} className="text-amber-500" />
              <span className="text-xs font-bold text-amber-700">{pendingCards.length}</span>
              <span className="text-xs text-amber-500">pending</span>
            </div>
          ) : (
            <div className="px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-100">
              <span className="text-xs text-gray-400">No pending</span>
            </div>
          )}

          {hasPending && (
            <div className="w-7 h-7 rounded-full flex items-center justify-center bg-gray-100">
              {open ? <ChevronUp size={15} className="text-gray-500" /> : <ChevronDown size={15} className="text-gray-500" />}
            </div>
          )}
        </div>
      </div>

      {/* Expandable pending section */}
      {hasPending && open && (
        <div className="border-t border-gray-100 bg-gray-50/50 px-5 py-4 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
            Pending Approval Requests ({pendingCards.length})
          </p>
          {pendingCards.map(({ req, type }, idx) => (
            <PendingUserCard
              key={`${req._id}-${type}`}
              request={req}
              type={type}
              sellerId={seller._id}
              onAction={onAction}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const SellersPerformance = () => {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/admin/sellers-performance", {
        withCredentials: true,
      });
      setSellers(data.sellers);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load seller performance data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Optimistic update — remove the acted-on request/type pair from pendingRequests
  // type: 'customer' | 'seller'
  // actionResult: 'approved' | 'rejected'
  const handleAction = useCallback((sellerId, requestId, type, actionResult) => {
    setSellers((prev) =>
      prev.map((s) => {
        if (String(s.seller?._id) !== String(sellerId)) return s;

        // Update the specific request's status field optimistically
        const updatedPending = s.pendingRequests.map((r) => {
          if (r._id !== requestId) return r;
          if (type === "customer") return { ...r, conversionStatus: actionResult };
          if (type === "seller")   return { ...r, sellerConversionStatus: actionResult };
          return r;
        });

        // Re-derive pendingCount from the updated list (using same $or logic as backend)
        const newPendingCount = updatedPending.filter(
          (r) => r.conversionStatus === "pending_approval" || r.sellerConversionStatus === "pending_approval"
        ).length;

        const newApproved = (type === "customer" && actionResult === "approved")
          ? s.approvedCount + 1
          : s.approvedCount;

        return {
          ...s,
          pendingRequests: updatedPending,
          pendingCount:    newPendingCount,
          approvedCount:   newApproved,
        };
      })
    );
  }, []);

  const totalPending  = sellers.reduce((acc, s) => acc + (s.pendingCount ?? 0), 0);
  const totalApproved = sellers.reduce((acc, s) => acc + (s.approvedCount ?? 0), 0);

  return (
    <div className="p-8">
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Admin Panel</p>
        <h1 className="text-3xl font-extrabold text-gray-900">Sellers Performance</h1>
        <p className="text-gray-500 text-sm mt-1">
          Review and approve customer conversion and seller promotion requests.
        </p>
      </div>

      {/* Summary Strip */}
      {!loading && !error && sellers.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center">
              <User2 size={18} className="text-brand-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">Total Sellers</p>
              <p className="text-2xl font-extrabold text-gray-800">{sellers.length}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <TrendingUp size={18} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">Total Converted</p>
              <p className="text-2xl font-extrabold text-gray-800">{totalApproved}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-amber-100 shadow-sm p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <Clock size={18} className="text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">Awaiting Approval</p>
              <p className="text-2xl font-extrabold text-amber-600">{totalPending}</p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>
      )}

      {loading && (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4 animate-pulse">
              <div className="w-9 h-9 bg-gray-200 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 bg-gray-200 rounded w-1/4" />
                <div className="h-3 bg-gray-200 rounded w-1/3" />
              </div>
              <div className="h-7 bg-gray-200 rounded-xl w-24" />
            </div>
          ))}
        </div>
      )}

      {!loading && !error && sellers.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <InboxIcon size={56} className="text-gray-200 mb-4" />
          <p className="text-lg font-semibold text-gray-500">No seller activity yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Sellers need to be assigned leads before conversion requests appear here.
          </p>
        </div>
      )}

      {!loading && sellers.length > 0 && (
        <div className="space-y-4">
          {sellers.map((s, idx) => (
            <SellerRow
              key={s.seller?._id ?? idx}
              sellerData={s}
              onAction={handleAction}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SellersPerformance;
