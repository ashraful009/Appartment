import React from 'react';

const GMDashboard = () => {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">GM Dashboard</h1>
        <p className="text-gray-500 mt-2">Welcome General Manager.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center text-gray-500 flex flex-col items-center justify-center min-h-[300px]">
        <p className="text-lg">Placeholder content for the GM Dashboard.</p>
        <p className="text-sm mt-2 opacity-75">Operations and regional metrics will appear here.</p>
      </div>
    </div>
  );
};

export default GMDashboard;
