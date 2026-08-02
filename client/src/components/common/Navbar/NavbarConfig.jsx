import React from "react";
import { LayoutDashboard, Store, ShieldCheck, Briefcase, TrendingUp, Users, Wallet } from "lucide-react";

export const ROLE_LINKS = [
  { role: "customer",   label: "Customer Panel",   to: "/customer-panel", icon: <LayoutDashboard size={14} /> },
  { role: "seller",     label: "Seller Panel",     to: "/seller-panel",   icon: <Store size={14} /> },
  { role: "admin",      label: "Admin Panel",      to: "/admin-panel",    icon: <ShieldCheck size={14} /> },
  { role: "Director",   label: "Director Panel",   to: "/director",       icon: <Briefcase size={14} /> },
  { role: "GM",         label: "GM Panel",         to: "/gm",             icon: <TrendingUp size={14} /> },
  { role: "AGM",        label: "AGM Panel",        to: "/agm",            icon: <TrendingUp size={14} /> },
  { role: "area_manager", label: "Area Manager Panel", to: "/area-manager", icon: <TrendingUp size={14} /> },
  { role: "Accountant", label: "Accountant Panel", to: "/accountant",     icon: <ShieldCheck size={14} /> },
  { role: "DataEntry",  label: "Data Entry Panel", to: "/data-entry",     icon: <ShieldCheck size={14} /> },
  { role: "Management", label: "Management Panel", to: "/management",     icon: <Briefcase size={14} /> },
  { role: "member",     label: "Member Panel",     to: "/member",         icon: <Users size={14} /> },
  { role: "Investor",   label: "Investor Panel",   to: "/investor",       icon: <Wallet size={14} /> },
];


