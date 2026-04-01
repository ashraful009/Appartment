import React from 'react';

const DirectorDashboard = () => {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Director Dashboard</h1>
        <p className="text-gray-500 mt-2">Welcome Director.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center text-gray-500 flex flex-col items-center justify-center min-h-[300px]">
        <p className="text-lg">Placeholder content for the Director Dashboard.</p>
        <p className="text-sm mt-2 opacity-75">Analytics, team reports, and strategic overviews will appear here.</p>
      </div>
    </div>
  );
};

export default DirectorDashboard;
