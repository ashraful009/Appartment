import React from "react";
import StaffDashboard from "../../components/staff/StaffDashboard";

const ManagementDashboard = () => (
  <StaffDashboard
    basePath="/api/management"
    title="Management Dashboard"
    subtitle="Give final confirmation to data-entry-approved payments. This updates the user's status."
  />
);

export default ManagementDashboard;
