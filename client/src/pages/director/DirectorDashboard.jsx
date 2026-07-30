import React from 'react';
import SubtreeReportCard from '../../components/hierarchy/SubtreeReportCard';
import LeadPoolTable from '../../components/distribution/LeadPoolTable';

const DirectorDashboard = () => {
  return (
    <div className="p-6 space-y-6">
      <SubtreeReportCard title="Director Organization Downline Overview" />
      <LeadPoolTable role="Director" />
    </div>
  );
};

export default DirectorDashboard;
