import React from "react";
import LeadPoolTable from "../../components/distribution/LeadPoolTable";

const AdminPendingLeads = () => {
  return (
    <div className="p-8 space-y-6">
      <LeadPoolTable title="Admin Lead Distribution Pool" />
    </div>
  );
};

export default AdminPendingLeads;
