import React from 'react';
import GenericPanelLayout from './GenericPanelLayout';
import { LayoutDashboard, GitFork } from 'lucide-react';

const AreaManagerLayout = () => {
  const links = [
    { to: "/area-manager", label: "Dashboard", icon: LayoutDashboard, end: true },
    { isDrillDown: true, label: "Tree Drill-down", icon: GitFork },
  ];
  return <GenericPanelLayout title="Area Manager Panel" links={links} />;
};

export default AreaManagerLayout;
