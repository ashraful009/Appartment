import React from 'react';
import SubtreeReportCard from '../../components/hierarchy/SubtreeReportCard';

const DirectorDashboard = () => {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Director Dashboard</h1>
        <p className="text-gray-500 mt-2">Executive strategic oversight and full organization hierarchy analytics.</p>
      </div>

      <SubtreeReportCard title="Director Organization Downline Overview" />
    </div>
  );
};

export default DirectorDashboard;
