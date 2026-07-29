import React, { useEffect, useState } from "react";
import axios from "axios";
import { Users, TrendingUp, AlertCircle, CheckCircle, ChevronRight, Share2 } from "lucide-react";
import DrillDownModal from "./DrillDownModal";

const SubtreeReportCard = ({ userId = "", title = "Hierarchy Subtree Analytics" }) => {
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
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-brand-50 text-brand-600 rounded-lg">
              <Share2 size={20} />
            </span>
            <h2 className="text-lg font-bold text-gray-800">{title}</h2>
          </div>
          <p className="text-gray-500 text-xs mt-1">
            Real-time aggregation across all subordinate levels in your reporting downline.
          </p>
        </div>

        <button
          onClick={() => setShowDrillDown(true)}
          className="inline-flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all shadow-sm shadow-brand-500/20 active:scale-95"
        >
          <span>Explore Tree Drill-down</span>
          <ChevronRight size={16} />
        </button>
      </div>

      
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
          Subordinate Team Structure
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-4 flex flex-col justify-between">
            <span className="text-xs font-semibold text-blue-700">General Managers (GM)</span>
            <span className="text-2xl font-extrabold text-blue-900 mt-2">{roleCounts?.GM ?? 0}</span>
          </div>
          <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-4 flex flex-col justify-between">
            <span className="text-xs font-semibold text-indigo-700">Asst. GMs (AGM)</span>
            <span className="text-2xl font-extrabold text-indigo-900 mt-2">{roleCounts?.AGM ?? 0}</span>
          </div>
          <div className="bg-orange-50/60 border border-orange-100 rounded-xl p-4 flex flex-col justify-between">
            <span className="text-xs font-semibold text-orange-700">Area Managers</span>
            <span className="text-2xl font-extrabold text-orange-900 mt-2">{roleCounts?.AreaManager ?? 0}</span>
          </div>
          <div className="bg-purple-50/60 border border-purple-100 rounded-xl p-4 flex flex-col justify-between">
            <span className="text-xs font-semibold text-purple-700">Sellers</span>
            <span className="text-2xl font-extrabold text-purple-900 mt-2">{roleCounts?.Seller ?? 0}</span>
          </div>
          <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-4 flex flex-col justify-between">
            <span className="text-xs font-semibold text-emerald-700">Customers</span>
            <span className="text-2xl font-extrabold text-emerald-900 mt-2">{roleCounts?.Customer ?? 0}</span>
          </div>
        </div>
      </div>

      
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
          Subtree Pipeline & Lead Performance
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-gray-50 border border-gray-200/80 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-600">Total Leads</p>
              <p className="text-2xl font-extrabold text-gray-900 mt-1">{leadStats?.totalLeads ?? 0}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gray-200/60 flex items-center justify-center text-gray-700">
              <Users size={20} />
            </div>
          </div>

          <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-amber-800">On Process Leads</p>
              <p className="text-2xl font-extrabold text-amber-950 mt-1">{leadStats?.onProcessLeads ?? 0}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700">
              <TrendingUp size={20} />
            </div>
          </div>

          <div className="bg-rose-50/60 border border-rose-200/80 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-rose-800">Cancelled / Lost Leads</p>
              <p className="text-2xl font-extrabold text-rose-950 mt-1">{leadStats?.cancelledLeads ?? 0}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-700">
              <AlertCircle size={20} />
            </div>
          </div>
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
