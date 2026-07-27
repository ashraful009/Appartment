import React from "react";
import { Link } from "react-router-dom";
import { User, LayoutDashboard, Store, ShieldCheck, Briefcase, TrendingUp, Users, Wallet } from "lucide-react";

export const ROLE_LINKS = [
  { role: "customer",   label: "Customer Panel",   to: "/customer-panel", icon: <LayoutDashboard size={14} /> },
  { role: "seller",     label: "Seller Panel",     to: "/seller-panel",   icon: <Store size={14} /> },
  { role: "admin",      label: "Admin Panel",      to: "/admin-panel",    icon: <ShieldCheck size={14} /> },
  { role: "Director",   label: "Director Panel",   to: "/director",       icon: <Briefcase size={14} /> },
  { role: "GM",         label: "GM Panel",         to: "/gm",             icon: <TrendingUp size={14} /> },
  { role: "AGM",        label: "AGM Panel",        to: "/agm",            icon: <TrendingUp size={14} /> },
  { role: "Accountant", label: "Accountant Panel", to: "/accountant",     icon: <ShieldCheck size={14} /> },
  { role: "DataEntry",  label: "Data Entry Panel", to: "/data-entry",     icon: <ShieldCheck size={14} /> },
  { role: "Management", label: "Management Panel", to: "/management",     icon: <Briefcase size={14} /> },
  { role: "member",     label: "Member Panel",     to: "/member",         icon: <Users size={14} /> },
  { role: "Investor",   label: "Investor Panel",   to: "/investor",       icon: <Wallet size={14} /> },
];

export const DropItem = ({ icon, label, to, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className="flex items-center gap-3 rounded-xl mx-2 px-3 py-2.5 transition-all duration-200 group"
    style={{
      fontFamily: "'Jost', sans-serif",
      fontSize: "0.8125rem",
      fontWeight: 500,
      color: "#0A1628",
      textDecoration: "none",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = "linear-gradient(135deg, rgba(201,148,42,0.08), rgba(232,184,75,0.04))";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = "transparent";
    }}
  >
    <span style={{ color: "#C9942A", flexShrink: 0 }}>{icon}</span>
    {label}
  </Link>
);
