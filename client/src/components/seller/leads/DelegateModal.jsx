import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Loader2, UserCheck, X } from "lucide-react";

const DelegateModal = ({ lead, onClose, onDelegated }) => {
  const [subSellers, setSubSellers] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    axios.get("/api/seller/team-overview", { withCredentials: true })
      .then(({ data }) => setSubSellers(data.team))
      .catch(() => toast.error("Could not load sub-sellers."))
      .finally(() => setLoading(false));
  }, []);

  const handleDelegate = async () => {
    if (!selectedId) { toast.error("Please select a sub-seller."); return; }
    setSubmitting(true);
    try {
      const { data } = await axios.put(
        `/api/requests/${lead._id}/delegate`,
        { targetSellerId: selectedId },
        { withCredentials: true }
      );
      toast.success(data.message || "Lead delegated!");
      onDelegated(lead._id);
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Delegation failed.");
    } finally { setSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-0.5">Delegate Lead</p>
            <h3 className="text-base font-extrabold text-gray-800">{lead.user?.name || "Lead"}</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
            <X size={16} className="text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <p className="text-sm text-gray-500">
            Select one of your sub-sellers to transfer this lead. A delegation note will be auto-logged.
          </p>
          {loading ? (
            <div className="h-10 bg-gray-100 rounded-xl animate-pulse" />
          ) : subSellers.length === 0 ? (
            <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
              You have no sub-sellers to delegate to.
            </p>
          ) : (
            <select
              value={selectedId}
              onChange={e => setSelectedId(e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white"
            >
              <option value="">— Select a sub-seller —</option>
              {subSellers.map(s => (
                <option key={s._id} value={s._id}>
                  {s.name} ({s.totalLeads} leads, {s.convertedLeads} converted)
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelegate}
            disabled={submitting || !selectedId || subSellers.length === 0}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-sm font-semibold transition-colors"
          >
            {submitting ? <Loader2 size={14} className="animate-spin" /> : <UserCheck size={14} />}
            {submitting ? "Delegating…" : "Confirm Delegate"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DelegateModal;
