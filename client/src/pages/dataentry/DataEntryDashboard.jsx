import React from "react";
import StaffDashboard from "../../components/staff/StaffDashboard";

const DataEntryDashboard = () => (
  <StaffDashboard
    basePath="/api/data-entry"
    title="Data Entry Dashboard"
    subtitle="Confirm accountant-approved payments and forward them to Management."
  />
);

export default DataEntryDashboard;
