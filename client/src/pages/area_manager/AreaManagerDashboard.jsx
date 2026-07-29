import React from 'react';
import SubtreeReportCard from '../../components/hierarchy/SubtreeReportCard';
import LeadPoolTable from '../../components/distribution/LeadPoolTable';

const AreaManagerDashboard = () => {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Area Manager Dashboard</h1>
        <p className="text-gray-500 mt-2">Regional sales leadership, seller team guidance, and customer lead performance metrics.</p>
      </div>

      <SubtreeReportCard title="Team Overview" />
      <LeadPoolTable role="area_manager" />
    </div>
  );
};

export default AreaManagerDashboard;
