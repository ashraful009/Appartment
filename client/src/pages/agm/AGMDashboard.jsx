import React from 'react';
import SubtreeReportCard from '../../components/hierarchy/SubtreeReportCard';
import LeadPoolTable from '../../components/distribution/LeadPoolTable';

const AGMDashboard = () => {
  return (
    <div className="p-6 space-y-6">
      <SubtreeReportCard title="AGM Hierarchy & Performance" />
      <LeadPoolTable role="AGM" />
    </div>
  );
};

export default AGMDashboard;
