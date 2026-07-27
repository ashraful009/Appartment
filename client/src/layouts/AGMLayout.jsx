import React from 'react';
import GenericPanelLayout from './GenericPanelLayout';
import { LayoutDashboard } from 'lucide-react';

const AGMLayout = () => {
  const links = [
    { to: "/agm", label: "Dashboard", icon: LayoutDashboard, end: true }
  ];
  return <GenericPanelLayout title="AGM Panel" links={links} />;
};

export default AGMLayout;
