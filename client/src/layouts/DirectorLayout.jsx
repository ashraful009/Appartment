import React from 'react';
import GenericPanelLayout from './GenericPanelLayout';
import { LayoutDashboard, GitFork } from 'lucide-react';

const DirectorLayout = () => {
  const links = [
    { to: "/director", label: "Dashboard", icon: LayoutDashboard, end: true },
    { isDrillDown: true, label: "Tree Drill-down", icon: GitFork },
  ];
  return <GenericPanelLayout title="Director Panel" links={links} />;
};

export default DirectorLayout;
