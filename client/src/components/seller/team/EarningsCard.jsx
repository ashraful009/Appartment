import React from "react";
import { DollarSign } from "lucide-react";

const EarningsCard = ({ totalEarnings, totalConversions, memberCount }) => (
  <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 shadow-lg relative overflow-hidden flex-1 min-w-0">
    <div className="absolute -right-8 -bottom-8 w-40 h-40 rounded-full bg-amber-500/10" />
    <div className="absolute -left-4 -top-8 w-28 h-28 rounded-full bg-amber-500/5" />
    <div className="relative">
      <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Total Team Earnings</p>
      <p className="text-4xl font-extrabold text-amber-400 mb-2">
        ৳{totalEarnings.toLocaleString()}
      </p>
      <div className="flex items-center gap-4 mt-3">
        <div className="text-center">
          <p className="text-2xl font-bold text-white">{memberCount}</p>
          <p className="text-xs text-gray-400">Members</p>
        </div>
        <div className="w-px h-8 bg-gray-700" />
        <div className="text-center">
          <p className="text-2xl font-bold text-emerald-400">{totalConversions}</p>
          <p className="text-xs text-gray-400">Conversions</p>
        </div>
        <div className="w-px h-8 bg-gray-700" />
        <div className="text-center">
          <p className="text-2xl font-bold text-amber-300">৳5,000</p>
          <p className="text-xs text-gray-400">/ Conversion</p>
        </div>
      </div>
    </div>
  </div>
);

export default EarningsCard;
