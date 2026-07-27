import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Menu, X, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const GenericPanelLayout = ({ title, links = [] }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="flex min-h-[calc(100vh-80px)] relative bg-gray-50">
      
      {/* Mobile Top Bar */}
      <div className="md:hidden absolute top-0 left-0 right-0 h-14 bg-white flex items-center justify-between px-4 z-20 shadow-sm border-b">
        <p className="text-sm font-semibold text-gray-900 uppercase tracking-widest">{title}</p>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-gray-500 hover:text-gray-900 focus:outline-none"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:sticky top-0 md:top-[80px] h-[100vh] md:h-[calc(100vh-80px)] w-64 bg-white border-r border-gray-200 flex flex-col flex-shrink-0 z-40
        transition-transform duration-300 ease-in-out
        ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-start">
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-gray-800 truncate">{title}</h2>
            {user?.name && <p className="text-sm text-gray-500 truncate mt-1">{user.name}</p>}
          </div>
          <button onClick={() => setMobileMenuOpen(false)} className="md:hidden text-gray-400">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {links.map((link, idx) => {
            const Icon = link.icon || LayoutDashboard;
            return (
              <NavLink
                key={idx}
                to={link.to}
                end={link.end}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                    isActive
                      ? "bg-brand-50 text-brand-700 shadow-sm"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`
                }
              >
                <Icon size={20} />
                {link.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all duration-200"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-gray-50 overflow-auto pt-14 md:pt-0 w-full min-w-0">
        <Outlet />
      </main>
    </div>
  );
};

export default GenericPanelLayout;
