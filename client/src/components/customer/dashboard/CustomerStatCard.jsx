import React from "react";


const CustomerStatCard = ({ title, value, icon: Icon, colorClass, loading }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-5 transition-all hover:shadow-md hover:-translate-y-0.5 group cursor-default">
      
      <div
        className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${colorClass} group-hover:scale-105 transition-transform`}
      >
        <Icon size={26} className="text-white" />
      </div>

      
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        {loading ? (
          <div className="mt-1 h-9 w-14 bg-gray-200 rounded-lg animate-pulse" />
        ) : (
          <p className="text-3xl font-extrabold text-gray-800 mt-0.5">
            {value ?? 0}
          </p>
        )}
      </div>
    </div>
  );
};

export default CustomerStatCard;
