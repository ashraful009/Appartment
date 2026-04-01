import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard } from 'lucide-react';

const DirectorLayout = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">Director Panel</h2>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <NavLink
            to="/director"
            end
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                isActive
                  ? "bg-brand-50 text-brand-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`
            }
          >
            <LayoutDashboard size={20} />
            Dashboard
          </NavLink>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 w-full flex flex-col min-h-screen relative overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6 md:hidden">
            <h2 className="text-lg font-bold text-gray-800">Director Panel</h2>
        </header>
        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DirectorLayout;
