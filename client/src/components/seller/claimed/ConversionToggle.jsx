import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { CheckCircle2, Loader2 } from "lucide-react";

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

  // ⏳ Pending admin approval — toggle ON but disabled
  if (conversionStatus === "pending_approval") {
    return (
      <div className="relative group flex items-center gap-2">
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

  // ❌ Status is 'none' or 'rejected' — toggle OFF, clickable
  const handleToggle = async () => {
    setLoading(true);
    try {
      await axios.put(
        `/api/requests/${req._id}/request-conversion`,
        {},
        { withCredentials: true }
      );
      toast.success("Conversion request sent! Awaiting admin approval.");
      onStatusChange(req._id, "pending_approval");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to submit conversion request.");
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
          <span className="inline-block w-4 h-4 bg-white rounded-full shadow transform translate-x-1 transition-transform" />
        </button>
      )}
      {conversionStatus === "rejected" && (
        <span className="text-xs text-red-500 font-medium">Rejected</span>
      )}
    </div>
  );
};

export default ConversionToggle;
