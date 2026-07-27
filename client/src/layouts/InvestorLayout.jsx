import React from 'react';
import GenericPanelLayout from './GenericPanelLayout';
import { LayoutDashboard, Building2 } from 'lucide-react';

const InvestorLayout = () => {
  const links = [
    { to: "/investor", label: "Dashboard", icon: LayoutDashboard, end: true },
    { to: "/investor/properties", label: "Properties", icon: Building2 }
  ];
  return <GenericPanelLayout title="Investor Panel" links={links} />;
};

export default InvestorLayout;
