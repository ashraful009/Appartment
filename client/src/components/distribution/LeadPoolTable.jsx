import React, { useState, useEffect } from "react";
import axios from "axios";
import { Users2, Send, Loader2, Search, UserCheck } from "lucide-react";
import toast from "react-hot-toast";

const LeadPoolTable = ({ role }) => {
  const [leads, setLeads] = useState([]);
  const [recipients, setRecipients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [distributingId, setDistributingId] = useState(null);
  
  // State for selected recipient for each lead { leadId: userId }
  const [selections, setSelections] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [poolRes, recipientsRes] = await Promise.all([
        axios.get("/api/distribution/pool", { withCredentials: true }),
        axios.get("/api/distribution/recipients", { withCredentials: true })
      ]);
      setLeads(poolRes.data.leads || []);
      setRecipients(recipientsRes.data.recipients || []);
    } catch (error) {
      console.error("Failed to fetch distribution data", error);
      toast.error("Failed to load lead pool.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (leadId, userId) => {
    setSelections(prev => ({ ...prev, [leadId]: userId }));
  };

  const handleDistribute = async (leadId) => {
    const targetUserId = selections[leadId];
    if (!targetUserId) {
      toast.error("Please select a recipient first.");
      return;
    }

    setDistributingId(leadId);
    try {
      await axios.post("/api/distribution/distribute", {
        leadId,
        targetUserId
      }, { withCredentials: true });
      
      toast.success("Lead distributed successfully!");
      setLeads(prev => prev.filter(l => l.id !== leadId));
      setSelections(prev => {
        const newSel = { ...prev };
        delete newSel[leadId];
        return newSel;
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to distribute lead.");
    } finally {
      setDistributingId(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center h-40">
        <Loader2 size={24} className="animate-spin text-brand-600" />
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
          <UserCheck size={20} className="text-gray-400" />
        </div>
        <h3 className="text-gray-900 font-semibold mb-1">Your Lead Pool is Empty</h3>
        <p className="text-gray-500 text-sm">You have no leads waiting to be distributed.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users2 size={20} className="text-brand-600" />
          <h2 className="text-lg font-bold text-gray-900">Lead Distribution Pool</h2>
        </div>
        <span className="bg-brand-50 text-brand-700 text-xs font-bold px-3 py-1 rounded-full border border-brand-200">
          {leads.length} Pending
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold">
            <tr>
              <th className="px-6 py-4">Lead Details</th>
              <th className="px-6 py-4">Source & Property</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Assign To</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {leads.map(lead => (
              <tr key={lead.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-semibold text-gray-900">{lead.guest_name || lead.customer_name || "Unknown"}</div>
                  <div className="text-xs mt-0.5">{lead.guest_phone || lead.customer_phone || "No phone"}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                    {lead.source}
                  </span>
                  <div className="text-xs mt-1 max-w-[200px] truncate" title={lead.property_name}>
                    {lead.property_name || "General Inquiry"}
                  </div>
                </td>
                <td className="px-6 py-4 text-xs whitespace-nowrap">
                  {new Date(lead.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <select
                    value={selections[lead.id] || ""}
                    onChange={(e) => handleSelect(lead.id, e.target.value)}
                    className="w-full max-w-[200px] px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white"
                  >
                    <option value="">-- Select Recipient --</option>
                    {recipients.map(r => (
                      <option key={r.id} value={r.id}>
                        {r.name} ({r.role})
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => handleDistribute(lead.id)}
                    disabled={!selections[lead.id] || distributingId === lead.id}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors"
                  >
                    {distributingId === lead.id ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Send size={14} />
                    )}
                    Distribute
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeadPoolTable;
