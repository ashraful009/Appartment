import React from 'react';
import SubtreeReportCard from '../../components/hierarchy/SubtreeReportCard';

const AGMDashboard = () => {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Assistant General Manager (AGM) Dashboard</h1>
        <p className="text-gray-500 mt-2">Team leadership, sales pipeline oversight, and subordinate performance metrics.</p>
      </div>

      <SubtreeReportCard title="AGM Subtree & Team Analytics" />
    </div>
  );
};

export default AGMDashboard;
