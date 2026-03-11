import React from "react";
import { Users } from "lucide-react";

const PerformanceStats = ({ stats }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
    <div className="px-6 py-5 border-b border-gray-50 bg-gray-50/50">
      <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest flex items-center gap-2">
        <Users size={14} className="text-brand-600" />
        Performance Summary
      </h3>
    </div>
    <div className="p-6 grid grid-cols-2 gap-4">
      <div className="bg-brand-50 rounded-xl p-4 border border-brand-100/50 text-center">
        <p className="text-3xl font-black text-brand-700">{stats.totalAssignedLeads}</p>
        <p className="text-[10px] font-bold uppercase tracking-wider text-brand-600/70 mt-1">Total Leads</p>
      </div>
      <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100/50 text-center">
        <p className="text-3xl font-black text-emerald-600">{stats.totalConvertedCustomers}</p>
        <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600/70 mt-1">Converted</p>
      </div>
    </div>
  </div>
);

export default PerformanceStats;
