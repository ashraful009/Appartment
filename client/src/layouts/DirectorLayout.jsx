import React from 'react';
import GenericPanelLayout from './GenericPanelLayout';
import { LayoutDashboard } from 'lucide-react';

const DirectorLayout = () => {
  const links = [
    { to: "/director", label: "Dashboard", icon: LayoutDashboard, end: true }
  ];
  return <GenericPanelLayout title="Director Panel" links={links} />;
};

export default DirectorLayout;
