import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { InboxIcon, Calendar } from "lucide-react";
import AssignedRow from "../../components/seller/leads/AssignedRow";
import DelegateModal from "../../components/seller/leads/DelegateModal";
import FollowUpTaskCard from "../../components/seller/leads/FollowUpTaskCard";

// ── Helper ────────────────────────────────────────────────────────────────────
const isToday = (dateStr) => {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const today = new Date();
  return (
    d.getFullYear() === today.getFullYear() &&
    d.getMonth()    === today.getMonth()    &&
    d.getDate()     === today.getDate()
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
const AssignedLeads = () => {
  const [requests, setRequests]             = useState([]);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState("");
  const [expandedId, setExpandedId]         = useState(null);
  const [delegateTarget, setDelegateTarget] = useState(null);
  const [todayTasks, setTodayTasks]         = useState([]);
  const [previousTasks, setPreviousTasks]   = useState([]);
  const [tasksLoading, setTasksLoading]     = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [leadsRes, tasksRes] = await Promise.all([
          axios.get("/api/requests/assigned",  { withCredentials: true }),
          axios.get("/api/seller/tasks",        { withCredentials: true }),
        ]);
        setRequests(leadsRes.data.requests      || []);
        setTodayTasks(tasksRes.data.todayTasks  || []);
        setPreviousTasks(tasksRes.data.previousTasks || []);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load data.");
      } finally {
        setLoading(false);
        setTasksLoading(false);
      }
    };
    fetchAll();
  }, []);

  const handleUpdateTaskStatus = async (interactionId, newStatus) => {
    try {
      await axios.put(
        `/api/interactions/${interactionId}/followup-status`,
        { status: newStatus },
        { withCredentials: true }
      );
      if (newStatus === "Completed") {
        setTodayTasks(prev    => prev.filter(t => t._id !== interactionId));
        setPreviousTasks(prev => prev.filter(t => t._id !== interactionId));
      } else {
        const mark = (list) => list.map(t =>
          t._id === interactionId ? { ...t, followUpStatus: newStatus } : t
        );
        setTodayTasks(prev    => mark(prev));
        setPreviousTasks(prev => mark(prev));
      }
    } catch {
      toast.error("Failed to update task status.");
    }
  };

  const handleExpandByLeadId = (leadId) => {
    if (!leadId) return;
    setExpandedId(prev => (prev === leadId ? null : leadId));
    setTimeout(() => {
      document.getElementById(`lead-row-${leadId}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  };

  const handleStatusChange = (requestId, newStatus, statusKey) => {
    setRequests(prev =>
      prev.map(r => (r._id === requestId ? { ...r, [statusKey]: newStatus } : r))
    );
  };

  const handleUpdate = (requestId, updatedReq) => {
    setRequests(prev =>
      prev.map(r => (r._id === requestId ? { ...r, ...updatedReq } : r))
    );
  };

  const handleToggle    = (id)   => setExpandedId(prev => (prev === id ? null : id));
  const handleDelegate  = (lead) => setDelegateTarget(lead);
  const handleDelegated = (leadId) => {
    setRequests(prev => prev.filter(r => r._id !== leadId));
    setExpandedId(null);
  };

  const todayCount  = requests.filter(r => isToday(r.assignedAt)).length;
  const hasTasks    = todayTasks.length > 0 || previousTasks.length > 0;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">My Assigned Leads</h1>
        {!loading && todayCount > 0 && (
          <div className="mt-3 inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm font-semibold px-4 py-2 rounded-xl">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            {todayCount} new lead{todayCount > 1 ? "s" : ""} assigned today!
          </div>
        )}
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>
      )}

      {/* ── Follow-up Tasks Section ── */}
      {!tasksLoading && hasTasks && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Calendar size={14} className="text-brand-500" />
            Follow-up Tasks
          </h2>

          {previousTasks.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-semibold text-red-500 uppercase tracking-wider mb-2">
                ⚠️ PREVIOUS TASKS — OVERDUE ({previousTasks.length})
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
                {previousTasks.map(t => (
                  <FollowUpTaskCard
                    key={t._id}
                    task={t}
                    isOverdue={true}
                    onUpdateStatus={handleUpdateTaskStatus}
                    onExpandLead={handleExpandByLeadId}
                  />
                ))}
              </div>
            </div>
          )}

          {todayTasks.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-2">
                📅 TODAY'S FOLLOW-UPS ({todayTasks.length})
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
                {todayTasks.map(t => (
                  <FollowUpTaskCard
                    key={t._id}
                    task={t}
                    isOverdue={false}
                    onUpdateStatus={handleUpdateTaskStatus}
                    onExpandLead={handleExpandByLeadId}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tasks skeleton */}
      {tasksLoading && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
          <div className="h-4 bg-gray-200 rounded w-36 animate-pulse mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      )}

      {/* Leads Skeleton */}
      {loading && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-50">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4 animate-pulse">
                <div className="w-11 h-11 bg-gray-200 rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 bg-gray-200 rounded w-1/3" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && requests.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <InboxIcon size={56} className="text-gray-200 mb-4" />
          <p className="text-lg font-semibold text-gray-500">No assigned leads yet</p>
          <p className="text-sm text-gray-400 mt-1">The admin will assign leads to you. Check back soon.</p>
        </div>
      )}

      {/* Leads Table */}
      {!loading && requests.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Property</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600">User Name</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Contact</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Stage</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Priority</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600 whitespace-nowrap">Assigned On</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600 whitespace-nowrap">Last Contact</th>
                  <th className="px-4 py-3.5" />
                </tr>
              </thead>
              <tbody>
                {requests.map(req => (
                  <React.Fragment key={req._id}>
                    <tr id={`lead-row-${req._id}`} style={{ display: "none" }} />
                    <AssignedRow
                      req={req}
                      expanded={expandedId === req._id}
                      onToggle={() => handleToggle(req._id)}
                      onStatusChange={handleStatusChange}
                      onUpdate={handleUpdate}
                      onDelegate={() => handleDelegate(req)}
                    />
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
          <p className="px-5 py-3 text-xs text-gray-400 border-t border-gray-100">
            {requests.length} assigned lead{requests.length !== 1 ? "s" : ""}
          </p>
        </div>
      )}

      {/* Delegation Modal */}
      {delegateTarget && (
        <DelegateModal
          lead={delegateTarget}
          onClose={() => setDelegateTarget(null)}
          onDelegated={handleDelegated}
        />
      )}
    </div>
  );
};

export default AssignedLeads;
