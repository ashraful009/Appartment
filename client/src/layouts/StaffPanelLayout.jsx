import React from "react";
import GenericPanelLayout from "./GenericPanelLayout";
import { LayoutDashboard, ClipboardCheck, Users } from "lucide-react";

const StaffPanelLayout = ({ panelName, basePath, extraLinks = [] }) => {
  const links = [
    { to: basePath, end: true, icon: LayoutDashboard, label: "Dashboard" },
    { to: `${basePath}/pending`, icon: ClipboardCheck, label: "Pending Confirmations" },
    { to: `${basePath}/members`, icon: Users, label: "Members" },
    ...extraLinks,
  ];

  return <GenericPanelLayout title={panelName} links={links} />;
};

export default StaffPanelLayout;
