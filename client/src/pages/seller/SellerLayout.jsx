import React from "react";
import { NavLink, Outlet, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard, UserCheck, LogOut, ChevronRight, Users2,
} from "lucide-react";

const navItems = [
  { to: "/seller-panel", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/seller-panel/assigned", label: "Assigned Leads", icon: UserCheck },
  { to: "/seller-panel/my-team", label: "My Team", icon: Users2 },
];

const SellerLayout = () => {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Guard: must be logged in AND have seller (or admin) role
  if (!isAuthenticated || (!user?.roles?.includes("seller") && !user?.roles?.includes("admin"))) {
    return <Navigate to="/" replace />;
  }

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="flex min-h-[calc(100vh-80px)]">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col flex-shrink-0">
        <div className="px-6 py-5 border-b border-gray-700">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Seller Panel</p>
          <p className="text-sm font-semibold text-white mt-0.5 truncate">{user?.name}</p>
        </div>

        <nav className="flex-1 py-4 space-y-1 px-3">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to} to={to} end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? "bg-amber-500 text-white shadow-md"
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

        <div className="px-3 pb-5 border-t border-gray-700 pt-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-red-600 hover:text-white transition-all duration-200"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-gray-50 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default SellerLayout;
