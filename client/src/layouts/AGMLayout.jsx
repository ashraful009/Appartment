import React from 'react';
import GenericPanelLayout from './GenericPanelLayout';
import { LayoutDashboard, GitFork } from 'lucide-react';

const AGMLayout = () => {
  const links = [
    { to: "/agm", label: "Dashboard", icon: LayoutDashboard, end: true },
    { isDrillDown: true, label: "Tree Drill-down", icon: GitFork },
  ];
  return <GenericPanelLayout title="AGM Panel" links={links} />;
};

export default AGMLayout;
