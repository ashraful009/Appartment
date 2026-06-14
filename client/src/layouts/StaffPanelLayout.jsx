import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { LayoutDashboard, ClipboardCheck, Users } from "lucide-react";

/**
 * Shared sidebar layout for the staff confirmation panels (Data Entry, Management).
 * Props: panelName, basePath (e.g. "/data-entry").
 */
const StaffPanelLayout = ({ panelName, basePath, extraLinks = [] }) => {
  const links = [
    { to: basePath, end: true, icon: LayoutDashboard, label: "Dashboard" },
    { to: `${basePath}/pending`, icon: ClipboardCheck, label: "Pending Confirmations" },
    { to: `${basePath}/members`, icon: Users, label: "Members" },
    ...extraLinks,
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">{panelName}</h2>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {links.map(({ to, end, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                  isActive
                    ? "bg-brand-50 text-brand-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`
              }
            >
              <Icon size={20} />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="flex-1 w-full flex flex-col min-h-screen relative overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6 md:hidden">
          <h2 className="text-lg font-bold text-gray-800">{panelName}</h2>
        </header>
        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default StaffPanelLayout;
