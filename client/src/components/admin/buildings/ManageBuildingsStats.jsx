import React from "react";

const ManageBuildingsStats = ({ properties }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      <div className="bg-white border rounded-xl p-6 shadow-sm">
        <p className="text-sm text-gray-500">Total Buildings</p>
        <h2 className="text-3xl font-bold text-gray-900 mt-1">
          {properties.length}
        </h2>
      </div>

      <div className="bg-white border rounded-xl p-6 shadow-sm">
        <p className="text-sm text-gray-500">Total Floors</p>
        <h2 className="text-3xl font-bold text-gray-900 mt-1">
          {properties.reduce((sum, p) => sum + (p.floors || 0), 0)}
        </h2>
      </div>

      <div className="bg-white border rounded-xl p-6 shadow-sm">
        <p className="text-sm text-gray-500">Upcoming Handover</p>
        <h2 className="text-3xl font-bold text-gray-900 mt-1">
          {properties.filter((p) => p.handoverTime && p.handoverTime !== "Completed").length}
        </h2>
      </div>
    </div>
  );
};

export default ManageBuildingsStats;
