import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Loader2, ChevronRight, Phone } from "lucide-react";

/**
 * LeadRow — single pending lead row with seller assignment dropdown + button.
 * Props: req, sellers (array), onAssigned(requestId) callback
 */
const LeadRow = ({ req, sellers, onAssigned }) => {
  const [selectedSeller, setSelectedSeller] = useState("");
  const [assigning, setAssigning]           = useState(false);

  const handleAssign = async () => {
    if (!selectedSeller) { toast.error("Please select a seller before assigning."); return; }
    setAssigning(true);
    try {
      await axios.put(`/api/admin/requests/${req._id}/assign`, { sellerId: selectedSeller }, { withCredentials: true });
      toast.success("Lead assigned successfully!");
      onAssigned(req._id);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to assign lead.");
    } finally { setAssigning(false); }
  };

  const { property, user } = req;

  return (
    <tr className="hover:bg-gray-50/70 transition-colors border-b border-gray-100 last:border-0">
      {/* Property */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          {property?.mainImage ? (
            <img src={property.mainImage} alt={property.name}
              className="w-12 h-12 rounded-xl object-cover flex-shrink-0 border border-gray-200" />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-brand-800 flex items-center justify-center flex-shrink-0">
              <span className="text-white/60 text-xs font-bold">N/A</span>
            </div>
          )}
          <div className="min-w-0">
            <p className="font-semibold text-gray-800 text-sm truncate max-w-[180px]">{property?.name || "—"}</p>
            <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[160px]">{property?.address || "—"}</p>
          </div>
        </div>
      </td>

      {/* User */}
      <td className="px-5 py-4">
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
      </td>

      {/* Requested on */}
      <td className="px-5 py-4 text-xs text-gray-400 whitespace-nowrap">
        {new Date(req.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
      </td>

      {/* Assign To */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-2">
          <select
            value={selectedSeller}
            onChange={e => setSelectedSeller(e.target.value)}
            disabled={assigning}
            className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white text-gray-700
                       focus:outline-none focus:ring-2 focus:ring-brand-400
                       hover:border-gray-300 transition-colors disabled:opacity-50 min-w-[220px]"
          >
            <option value="">— Select a seller —</option>
            {sellers.map(s => (
              <option key={s._id} value={s._id}>{s.name} (Active Leads: {s.currentLeadCount})</option>
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
              : <><ChevronRight size={13} /> Assign</>}
          </button>
        </div>
      </td>
    </tr>
  );
};

export default LeadRow;
