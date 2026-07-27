import React from 'react';
import GenericPanelLayout from './GenericPanelLayout';
import { LayoutDashboard } from 'lucide-react';

const MemberLayout = () => {
  const links = [
    { to: "/member", label: "Dashboard", icon: LayoutDashboard, end: true }
  ];
  return <GenericPanelLayout title="Member Panel" links={links} />;
};

export default MemberLayout;
