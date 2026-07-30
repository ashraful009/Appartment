import React from 'react';
import SubtreeReportCard from '../../components/hierarchy/SubtreeReportCard';
import LeadPoolTable from '../../components/distribution/LeadPoolTable';

const AreaManagerDashboard = () => {
  return (
    <div className="p-6 space-y-6">
      <SubtreeReportCard title="Team Overview" />
      <LeadPoolTable role="area_manager" />
    </div>
  );
};

export default AreaManagerDashboard;
