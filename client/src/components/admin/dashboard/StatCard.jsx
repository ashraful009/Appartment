import React from "react";
import { Link } from "react-router-dom";

/**
 * StatCard — reusable admin dashboard stat tile.
 * Props: icon, label, value, color (bg class), loading, badge (number), to (Link href)
 */
const StatCard = ({ icon: Icon, label, value, color, loading, badge, to }) => {
  const inner = (
    <div className="relative bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-5 transition-all hover:shadow-md hover:-translate-y-0.5 cursor-pointer group">
      {badge > 0 && (
        <span className="absolute -top-2 -right-2 z-10 bg-red-500 text-white text-[11px] font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg animate-bounce">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${color} group-hover:scale-105 transition-transform`}>
        <Icon size={26} className="text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        {loading ? (
          <div className="mt-1 h-8 w-16 bg-gray-200 rounded-lg animate-pulse" />
        ) : (
          <p className="text-3xl font-extrabold text-gray-800 mt-0.5">{value ?? 0}</p>
        )}
      </div>
    </div>
  );
  return to ? <Link to={to} className="block">{inner}</Link> : inner;
};

export default StatCard;
