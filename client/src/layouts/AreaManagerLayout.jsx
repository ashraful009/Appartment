import React from 'react';
import GenericPanelLayout from './GenericPanelLayout';
import { LayoutDashboard } from 'lucide-react';

const AreaManagerLayout = () => {
  const links = [
    { to: "/area-manager", label: "Dashboard", icon: LayoutDashboard, end: true }
  ];
  return <GenericPanelLayout title="Area Manager Panel" links={links} />;
};

export default AreaManagerLayout;
