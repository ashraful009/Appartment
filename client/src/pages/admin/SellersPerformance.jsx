import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { User2, TrendingUp, Clock, InboxIcon, Loader2 } from "lucide-react";

import SellerRow from "../../components/SellerRow";
import SellerProfileModal from "../../components/SellerProfileModal";

// ── Main Page ─────────────────────────────────────────────────────────────────
const SellersPerformance = () => {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ── Modal helpers ──────────────────────────────────────────────────────────
  const openProfile = (sellerData) => {
    setSelectedSeller(sellerData);
    setIsModalOpen(true);
  };
  const closeProfile = () => {
    setIsModalOpen(false);
    setSelectedSeller(null);
  };

  // ── Data fetching ──────────────────────────────────────────────────────────
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

  // ── Optimistic update after approve / reject ───────────────────────────────
  // type: 'customer' | 'seller';  actionResult: 'approved' | 'rejected'
  const handleAction = useCallback((sellerId, requestId, type, actionResult) => {
    setSellers((prev) =>
      prev.map((s) => {
        if (String(s.seller?._id) !== String(sellerId)) return s;

        const updatedPending = s.pendingRequests.map((r) => {
          if (r._id !== requestId) return r;
          if (type === "customer") return { ...r, conversionStatus: actionResult };
          if (type === "seller")   return { ...r, sellerConversionStatus: actionResult };
          return r;
        });

        const newPendingCount = updatedPending.filter(
          (r) =>
            r.conversionStatus === "pending_approval" ||
            r.sellerConversionStatus === "pending_approval"
        ).length;

        const newApproved =
          type === "customer" && actionResult === "approved"
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

  // ── Derived totals ─────────────────────────────────────────────────────────
  const totalPending = sellers.reduce((acc, s) => acc + (s.pendingCount ?? 0), 0);
  const totalApproved = sellers.reduce((acc, s) => acc + (s.approvedCount ?? 0), 0);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="p-8">
      {/* Page Header */}
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

      {/* Error */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4 animate-pulse"
            >
              <div className="w-9 h-9 bg-gray-200 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 bg-gray-200 rounded w-1/4" />
                <div className="h-3   bg-gray-200 rounded w-1/3" />
              </div>
              <div className="h-7 bg-gray-200 rounded-xl w-24" />
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && sellers.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <InboxIcon size={56} className="text-gray-200 mb-4" />
          <p className="text-lg font-semibold text-gray-500">No seller activity yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Sellers need to be assigned leads before conversion requests appear here.
          </p>
        </div>
      )}

      {/* Seller list */}
      {!loading && sellers.length > 0 && (
        <div className="space-y-4">
          {sellers.map((s, idx) => (
            <SellerRow
              key={s.seller?._id ?? idx}
              sellerData={s}
              onAction={handleAction}
              onViewProfile={openProfile}
            />
          ))}
        </div>
      )}

      {/* Profile Modal */}
      {isModalOpen && selectedSeller && (
        <SellerProfileModal
          sellerId={selectedSeller.seller?._id}
          sellerBasic={selectedSeller.seller}
          approvedCount={selectedSeller.approvedCount}
          pendingCount={selectedSeller.pendingCount}
          onClose={closeProfile}
        />
      )}
    </div>
  );
};

export default SellersPerformance;
