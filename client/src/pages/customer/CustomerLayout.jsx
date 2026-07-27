import React, { useState } from "react";
import { NavLink, Outlet, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard, ShieldCheck, FileText, User, LogOut, ChevronRight,
  Menu, X
} from "lucide-react";

const navItems = [
  { to: "/customer-panel",              label: "Dashboard",      icon: LayoutDashboard, end: true },
  { to: "/customer-panel/requests",     label: "My Requests",    icon: FileText },
  { to: "/customer-panel/vault",        label: "Document Vault", icon: ShieldCheck },
  { to: "/customer-panel/profile",      label: "My Profile",     icon: User },
];


const CustomerLayout = () => {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="flex min-h-[calc(100vh-80px)] relative">
      
      <div className="md:hidden absolute top-0 left-0 right-0 h-14 bg-gray-900 flex items-center justify-between px-4 z-20 shadow-md">
        <p className="text-sm font-semibold text-white uppercase tracking-widest">Customer Panel</p>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-gray-300 hover:text-white focus:outline-none"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      
      {mobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      
      <aside className={`
        fixed md:sticky top-0 md:top-[80px] h-[100vh] md:h-[calc(100vh-80px)] w-64 bg-gray-900 text-white flex flex-col flex-shrink-0 z-40
        transition-transform duration-300 ease-in-out
        ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        
        <div className="px-6 py-5 border-b border-gray-700 hidden md:block">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
            Customer Panel
          </p>
          <p className="text-sm font-semibold text-white mt-0.5 truncate">
            {user?.name}
          </p>
          <p className="text-xs text-gray-500 truncate mt-0.5">{user?.email}</p>
        </div>

        
        <div className="px-6 py-5 border-b border-gray-700 md:hidden flex justify-between items-start">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
              Customer Panel
            </p>
            <p className="text-sm font-semibold text-white mt-0.5 truncate">
              {user?.name}
            </p>
            <p className="text-xs text-gray-500 truncate mt-0.5">{user?.email}</p>
          </div>
          <button onClick={() => setMobileMenuOpen(false)} className="text-gray-400">
            <X size={20} />
          </button>
        </div>

        
        <nav className="flex-1 py-4 space-y-1 px-3 overflow-y-auto">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setMobileMenuOpen(false)}
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

      
      <main className="flex-1 bg-gray-50 overflow-auto pt-14 md:pt-0 w-full min-w-0">
        <Outlet />
      </main>
    </div>
  );
};

export default CustomerLayout;
