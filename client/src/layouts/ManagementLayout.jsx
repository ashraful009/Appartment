import React from "react";
import { Building2, BarChart2 } from "lucide-react";
import StaffPanelLayout from "./StaffPanelLayout";

const ManagementLayout = () => (
  <StaffPanelLayout
    panelName="Management Panel"
    basePath="/management"
    extraLinks={[
      { to: "/management/allocate", icon: Building2, label: "Building Allocate" },
      { to: "/management/analysis", icon: BarChart2, label: "Analysis" },
    ]}
  />
);

export default ManagementLayout;
