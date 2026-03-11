import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Mail, Phone, Building2, Loader2,
  CheckCircle2, XCircle, Store, UserCheck,
} from "lucide-react";
import Avatar from "./Avatar";

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

// ── PendingUserCard ───────────────────────────────────────────────────────────
/**
 * Props:
 *  - request  {object}  The PriceRequest document (populated with user + property)
 *  - type     {string}  "customer" | "seller"
 *  - sellerId {string}  The seller who owns this request
 *  - onAction {fn}      (sellerId, requestId, type, result) => void
 */
const PendingUserCard = ({ request, type, sellerId, onAction }) => {
  const [accepting, setAccepting] = useState(false);
  const [rejecting, setRejecting] = useState(false);

  const approveEndpoint = type === "seller"
    ? `/api/admin/requests/${request._id}/approve-seller-conversion`
    : `/api/admin/requests/${request._id}/approve-conversion`;

  const rejectEndpoint = type === "seller"
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
        <Avatar alt={request.user?.name} size="md" />
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <p className="font-semibold text-gray-800 text-sm">
              {request.user?.name || "—"}
            </p>
            <TypeBadge type={type} />
          </div>
          {request.user?.email && (
            <a href={`mailto:${request.user.email}`}
              className="flex items-center gap-1 text-xs text-brand-600 hover:underline mt-0.5">
              <Mail size={11} />{request.user.email}
            </a>
          )}
          {request.user?.phone && (
            <a href={`tel:${request.user.phone}`}
              className="flex items-center gap-1 text-xs text-emerald-600 hover:underline mt-0.5">
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

export default PendingUserCard;
