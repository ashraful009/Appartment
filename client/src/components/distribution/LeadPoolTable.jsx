import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Users2, Send, Loader2, UserCheck, Building2, HelpCircle,
  Phone, Calendar, CheckSquare, Square, X, Search, CheckCircle2
} from "lucide-react";
import toast from "react-hot-toast";

const formatDate = (dateValue) => {
  if (!dateValue) return "—";
  try {
    const d = new Date(dateValue);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (e) {
    return "—";
  }
};

const LeadPoolTable = ({ title = "Lead Distribution Pool" }) => {
  const [leads, setLeads] = useState([]);
  const [recipients, setRecipients] = useState([]);
  const [targetRole, setTargetRole] = useState("");
  const [loading, setLoading] = useState(true);

  // Checkbox selection state: Set of selected lead IDs
  const [selectedLeadIds, setSelectedLeadIds] = useState(new Set());

  // Recipient Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecipientId, setSelectedRecipientId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [distributing, setDistributing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [poolRes, recipientsRes] = await Promise.all([
        axios.get("/api/distribution/pool", { withCredentials: true }),
        axios.get("/api/distribution/recipients", { withCredentials: true })
      ]);
      setLeads(poolRes.data.leads || []);
      setRecipients(recipientsRes.data.recipients || []);
      setTargetRole(recipientsRes.data.targetRole || "");
    } catch (error) {
      console.error("Failed to fetch distribution data", error);
      toast.error("Failed to load lead pool.");
    } finally {
      setLoading(false);
    }
  };

  // Toggle single row selection
  const toggleSelectRow = (id) => {
    setSelectedLeadIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Toggle select all
  const toggleSelectAll = () => {
    if (selectedLeadIds.size === leads.length) {
      setSelectedLeadIds(new Set());
    } else {
      setSelectedLeadIds(new Set(leads.map((l) => l.id || l._id)));
    }
  };

  // Open Distribute Modal
  const openDistributeModal = () => {
    if (selectedLeadIds.size === 0) {
      toast.error("Please select at least one lead to distribute.");
      return;
    }
    if (recipients.length === 0) {
      toast.error(`No available ${targetRole || "recipients"} in your downline.`);
      return;
    }
    setSelectedRecipientId(recipients[0]?.id || recipients[0]?._id || "");
    setIsModalOpen(true);
  };

  // Submit Bulk Distribution
  const handleBulkDistribute = async () => {
    if (!selectedRecipientId) {
      toast.error("Please select a recipient.");
      return;
    }

    const idsArray = Array.from(selectedLeadIds);
    setDistributing(true);

    try {
      const { data } = await axios.post(
        "/api/distribution/distribute",
        {
          leadIds: idsArray,
          targetUserId: selectedRecipientId,
        },
        { withCredentials: true }
      );

      const targetObj = recipients.find(
        (r) => (r.id || r._id).toString() === selectedRecipientId.toString()
      );
      const recipientName = targetObj?.name || data.targetUserName || "recipient";

      toast.success(
        data.message || `Distributed ${idsArray.length} lead(s) to ${recipientName}.`
      );

      // Remove distributed leads from local state
      setLeads((prev) => prev.filter((l) => !selectedLeadIds.has(l.id || l._id)));
      setSelectedLeadIds(new Set());
      setIsModalOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to distribute leads.");
    } finally {
      setDistributing(false);
    }
  };

  const filteredRecipients = recipients.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center h-48">
        <div className="flex items-center gap-3 text-brand-600 font-medium">
          <Loader2 size={24} className="animate-spin" />
          <span>Loading lead distribution pool...</span>
        </div>
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 text-center">
        <div className="w-14 h-14 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <UserCheck size={28} />
        </div>
        <h3 className="text-lg font-extrabold text-gray-900 mb-1">Your Lead Pool is Empty</h3>
        <p className="text-gray-500 text-sm max-w-sm mx-auto">
          You currently have no unassigned leads in your distribution pool.
        </p>
      </div>
    );
  }

  const isAllSelected = leads.length > 0 && selectedLeadIds.size === leads.length;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header & Bulk Action Bar */}
      <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-brand-50 text-brand-600 rounded-xl">
            <Users2 size={20} />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-gray-900">{title}</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {leads.length} pending lead{leads.length !== 1 ? "s" : ""} waiting for distribution
            </p>
          </div>
        </div>

        {/* Top-Right Distribute Button */}
        <div className="flex items-center gap-3">
          {selectedLeadIds.size > 0 && (
            <span className="text-xs font-semibold text-brand-700 bg-brand-50 px-3 py-1.5 rounded-lg border border-brand-100">
              {selectedLeadIds.size} Selected
            </span>
          )}

          <button
            onClick={openDistributeModal}
            disabled={selectedLeadIds.size === 0}
            className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-sm shadow-brand-500/20 active:scale-95"
          >
            <Send size={16} />
            <span>
              Distribute {selectedLeadIds.size > 0 ? `(${selectedLeadIds.size})` : ""}
            </span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-100 text-xs uppercase font-semibold text-gray-500 select-none">
              <th className="w-12 px-5 py-3.5 text-center">
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className="text-gray-400 hover:text-brand-600 focus:outline-none"
                  title={isAllSelected ? "Deselect All" : "Select All"}
                >
                  {isAllSelected ? (
                    <CheckSquare size={18} className="text-brand-600" />
                  ) : (
                    <Square size={18} />
                  )}
                </button>
              </th>
              <th className="px-5 py-3.5">Property</th>
              <th className="px-5 py-3.5">Requested By</th>
              <th className="px-5 py-3.5 whitespace-nowrap">Requested On</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {leads.map((lead) => {
              const leadId = lead.id || lead._id;
              const isSelected = selectedLeadIds.has(leadId);

              // Extract Requester Info (Bug Fix #4)
              const requesterName =
                lead.user?.name ||
                lead.userName ||
                lead.guest_name ||
                lead.guestName ||
                "Guest Customer";

              const requesterPhone =
                lead.user?.phone ||
                lead.userPhone ||
                lead.guest_phone ||
                lead.guestPhone ||
                null;

              const isGuest = !lead.user_id && Boolean(lead.guest_name || lead.guest_phone);

              // Property Info
              const propName = lead.propertyName || lead.property?.name;

              // Requested Date (Bug Fix #5)
              const rawDate = lead.created_at || lead.createdAt || lead.created_on || lead.assigned_at;

              return (
                <tr
                  key={leadId}
                  onClick={() => toggleSelectRow(leadId)}
                  className={`cursor-pointer transition-colors ${
                    isSelected ? "bg-brand-50/40" : "hover:bg-gray-50/60"
                  }`}
                >
                  {/* Checkbox Column */}
                  <td className="px-5 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => toggleSelectRow(leadId)}
                      className="text-gray-400 hover:text-brand-600 focus:outline-none"
                    >
                      {isSelected ? (
                        <CheckSquare size={18} className="text-brand-600" />
                      ) : (
                        <Square size={18} />
                      )}
                    </button>
                  </td>

                  {/* Property Column */}
                  <td className="px-5 py-4">
                    {propName ? (
                      <div className="flex items-center gap-2">
                        <Building2 size={16} className="text-brand-600 flex-shrink-0" />
                        <span className="font-bold text-gray-900 truncate max-w-xs" title={propName}>
                          {propName}
                        </span>
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100">
                        <HelpCircle size={13} />
                        General Inquiry
                      </span>
                    )}
                  </td>

                  {/* Requested By Column */}
                  <td className="px-5 py-4">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-gray-900 text-sm">
                          {requesterName}
                        </span>
                        {isGuest ? (
                          <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-amber-50 text-amber-700 border border-amber-200">
                            Guest
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-blue-50 text-blue-700 border border-blue-200">
                            Customer
                          </span>
                        )}
                      </div>

                      {requesterPhone && (
                        <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                          <Phone size={12} className="text-gray-400" />
                          <span>{requesterPhone}</span>
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Requested On Column */}
                  <td className="px-5 py-4 text-xs font-medium text-gray-600 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={13} className="text-gray-400" />
                      <span>{formatDate(rawDate)}</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Recipient Picker Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <div>
                <h3 className="text-lg font-extrabold text-gray-900">
                  Distribute Leads ({selectedLeadIds.size})
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Select a {targetRole || "subordinate"} to receive the selected lead(s).
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {recipients.length > 5 && (
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder={`Search ${targetRole || "recipients"}...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  />
                </div>
              )}

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {filteredRecipients.map((rec) => {
                  const recId = (rec.id || rec._id).toString();
                  const isSelected = selectedRecipientId.toString() === recId;

                  return (
                    <div
                      key={recId}
                      onClick={() => setSelectedRecipientId(recId)}
                      className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        isSelected
                          ? "bg-brand-50 border-brand-300 ring-2 ring-brand-500/20"
                          : "bg-white border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${
                            isSelected
                              ? "bg-brand-600 text-white"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {rec.name?.[0]?.toUpperCase() || "?"}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{rec.name}</p>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2 py-0.5 rounded border border-brand-100">
                            {rec.role || targetRole}
                          </span>
                        </div>
                      </div>

                      {isSelected && (
                        <CheckCircle2 size={18} className="text-brand-600" />
                      )}
                    </div>
                  );
                })}

                {filteredRecipients.length === 0 && (
                  <p className="text-center py-6 text-xs text-gray-400">
                    No {targetRole || "recipients"} found matching search.
                  </p>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                disabled={distributing}
                className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-800 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkDistribute}
                disabled={distributing || !selectedRecipientId}
                className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-all shadow-sm shadow-brand-500/20"
              >
                {distributing ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Distributing...</span>
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    <span>Confirm Distribution</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadPoolTable;
