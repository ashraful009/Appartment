import React from 'react';
import GenericPanelLayout from './GenericPanelLayout';
import { LayoutDashboard, GitFork } from 'lucide-react';

const GMLayout = () => {
  const links = [
    { to: "/gm", label: "Dashboard", icon: LayoutDashboard, end: true },
    { isDrillDown: true, label: "Tree Drill-down", icon: GitFork },
  ];
  return <GenericPanelLayout title="GM Panel" links={links} />;
};

export default GMLayout;
