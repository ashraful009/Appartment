import React from 'react';
import SubtreeReportCard from '../../components/hierarchy/SubtreeReportCard';
import LeadPoolTable from '../../components/distribution/LeadPoolTable';

const GMDashboard = () => {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">General Manager (GM) Dashboard</h1>
        <p className="text-gray-500 mt-2">Regional operational performance and management reporting line analytics.</p>
      </div>

      <SubtreeReportCard title="GM Downline & Hierarchy Overview" />
      <LeadPoolTable role="GM" />
    </div>
  );
};

export default GMDashboard;
