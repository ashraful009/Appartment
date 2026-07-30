import React, { useEffect, useState } from "react";
import axios from "axios";
import DrillDownModal from "./DrillDownModal";

const SubtreeReportCard = ({ userId = "" }) => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [showDrillDown, setShowDrillDown] = useState(false);

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      try {
        const url = userId ? `/api/hierarchy/report?userId=${userId}` : `/api/hierarchy/report`;
        const res = await axios.get(url, { withCredentials: true });
        setReportData(res.data.report);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load hierarchy analytics.");
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [userId]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm animate-pulse space-y-4">
        <div className="h-6 bg-gray-200 rounded w-1/3" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm">
        {error}
      </div>
    );
  }

  if (!reportData) return null;

  const { roleCounts, leadStats } = reportData;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
        {/* GM */}
        <div className="bg-blue-50/60 border border-blue-100 rounded-xl px-3 py-2 flex items-center justify-between min-w-0">
          <span className="text-xl font-black text-blue-700 truncate mr-1" title="General Managers (GM)">GM</span>
          <span className="text-3xl font-black text-blue-900 flex-shrink-0">{roleCounts?.GM ?? 0}</span>
        </div>
        {/* AGM */}
        <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl px-3 py-2 flex items-center justify-between min-w-0">
          <span className="text-xl font-black text-indigo-700 truncate mr-1" title="Asst. GMs (AGM)">AGM</span>
          <span className="text-3xl font-black text-indigo-900 flex-shrink-0">{roleCounts?.AGM ?? 0}</span>
        </div>
        {/* Area Manager */}
        <div className="bg-orange-50/60 border border-orange-100 rounded-xl px-3 py-2 flex items-center justify-between min-w-0">
          <span className="text-xl font-black text-orange-700 truncate mr-1" title="Area Managers">Area Mgr</span>
          <span className="text-3xl font-black text-orange-900 flex-shrink-0">{roleCounts?.AreaManager ?? 0}</span>
        </div>
        {/* Seller */}
        <div className="bg-purple-50/60 border border-purple-100 rounded-xl px-3 py-2 flex items-center justify-between min-w-0">
          <span className="text-xl font-black text-purple-700 truncate mr-1" title="Sellers">Sellers</span>
          <span className="text-3xl font-black text-purple-900 flex-shrink-0">{roleCounts?.Seller ?? 0}</span>
        </div>
        {/* Customer */}
        <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl px-3 py-2 flex items-center justify-between min-w-0">
          <span className="text-xl font-black text-emerald-700 truncate mr-1" title="Customers">Customers</span>
          <span className="text-3xl font-black text-emerald-900 flex-shrink-0">{roleCounts?.Customer ?? 0}</span>
        </div>
        {/* Total Leads */}
        <div className="bg-gray-50 border border-gray-200/80 rounded-xl px-3 py-2 flex items-center justify-between min-w-0">
          <span className="text-xl font-black text-gray-700 truncate mr-1" title="Total Leads">Total Leads</span>
          <span className="text-3xl font-black text-gray-900 flex-shrink-0">{leadStats?.totalLeads ?? 0}</span>
        </div>
        {/* On Process Leads */}
        <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl px-3 py-2 flex items-center justify-between min-w-0">
          <span className="text-xl font-black text-amber-800 truncate mr-1" title="On Process Leads">On Process</span>
          <span className="text-3xl font-black text-amber-950 flex-shrink-0">{leadStats?.onProcessLeads ?? 0}</span>
        </div>
        {/* Cancelled / Lost Leads */}
        <div className="bg-rose-50/60 border border-rose-200/80 rounded-xl px-3 py-2 flex items-center justify-between min-w-0">
          <span className="text-xl font-black text-rose-800 truncate mr-1" title="Cancelled / Lost Leads">Cancelled</span>
          <span className="text-3xl font-black text-rose-950 flex-shrink-0">{leadStats?.cancelledLeads ?? 0}</span>
        </div>
      </div>

      {showDrillDown && (
        <DrillDownModal
          rootUserId={userId}
          onClose={() => setShowDrillDown(false)}
        />
      )}
    </div>
  );
};

export default SubtreeReportCard;
