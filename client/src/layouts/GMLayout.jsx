import React from 'react';
import GenericPanelLayout from './GenericPanelLayout';
import { LayoutDashboard } from 'lucide-react';

const GMLayout = () => {
  const links = [
    { to: "/gm", label: "Dashboard", icon: LayoutDashboard, end: true }
  ];
  return <GenericPanelLayout title="GM Panel" links={links} />;
};

export default GMLayout;
