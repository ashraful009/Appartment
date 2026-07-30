import React from 'react';
import SubtreeReportCard from '../../components/hierarchy/SubtreeReportCard';
import LeadPoolTable from '../../components/distribution/LeadPoolTable';

const GMDashboard = () => {
  return (
    <div className="p-6 space-y-6">
      <SubtreeReportCard title="GM Downline & Hierarchy Overview" />
      <LeadPoolTable role="GM" />
    </div>
  );
};

export default GMDashboard;
