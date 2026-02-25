import React from "react";
import { NavLink, Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard,
  ImagePlay,
  Building2,
  Users,
  LogOut,
  ChevronRight,
} from "lucide-react";

const navItems = [
  { to: "/admin-panel",           label: "Dashboard",       icon: LayoutDashboard, end: true },
  { to: "/admin-panel/banners",   label: "Manage Banners",  icon: ImagePlay },
  { to: "/admin-panel/buildings", label: "Add Building",    icon: Building2 },
  { to: "/admin-panel/users",     label: "Manage Users",    icon: Users },
];

const AdminLayout = () => {
  const { user, isAuthenticated, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Guard: only admins can enter
  if (!isAuthenticated || !user?.roles?.includes("admin")) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-[calc(100vh-80px)]">
      {/* ── Sidebar ─────────────────────────────────────────────── */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col flex-shrink-0">
        {/* Brand header */}
        <div className="px-6 py-5 border-b border-gray-700">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Admin Panel</p>
          <p className="text-sm font-semibold text-white mt-0.5 truncate">{user.name}</p>
        </div>

        {/* Nav links */}
        <nav className="flex-1 py-4 space-y-1 px-3">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? "bg-brand-600 text-white shadow-md"
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={18} className="flex-shrink-0" />
                  <span className="flex-1">{label}</span>
                  {isActive && <ChevronRight size={14} className="opacity-70" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Logout button */}
        <div className="px-3 pb-5 border-t border-gray-700 pt-4">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-red-600 hover:text-white transition-all duration-200"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────────────────────── */}
      <main className="flex-1 bg-gray-50 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
