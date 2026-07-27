import React from 'react';
import GenericPanelLayout from './GenericPanelLayout';
import { LayoutDashboard, ClipboardCheck, Users } from 'lucide-react';

const AccountantLayout = () => {
  const links = [
    { to: "/accountant", end: true, icon: LayoutDashboard, label: "Dashboard" },
    { to: "/accountant/pending", icon: ClipboardCheck, label: "Pending Confirmations" },
    { to: "/accountant/members", icon: Users, label: "Members" },
  ];
  return <GenericPanelLayout title="Accountant Panel" links={links} />;
};

export default AccountantLayout;
