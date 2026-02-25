import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  ChevronDown,
  User,
  LayoutDashboard,
  Store,
  ShieldCheck,
  LogOut,
  Menu,
  X,
} from "lucide-react";

// ── Default avatar SVG (shown when user.avatar is null) ─────────────────
const DefaultAvatar = () => (
  <div className="w-9 h-9 rounded-full bg-brand-100 border-2 border-brand-300 flex items-center justify-center text-brand-700 font-bold text-sm select-none">
    <User size={18} />
  </div>
);

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate      = useNavigate();
  const [dropOpen, setDropOpen]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setDropOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    await logout();
    setDropOpen(false);
    navigate("/");
  };

  return (
    <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-8 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* ── Logo ───────────────────────────────────────────────────── */}
          <Link
            to="/"
            className="text-2xl font-extrabold text-brand-700 tracking-tight hover:text-brand-800 transition-colors duration-200"
          >
            🏠 Apartment
          </Link>

          {/* ── Center Nav (Desktop) ─────────────────────────────────── */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/properties" className="nav-link">Properties</Link>
            <Link to="/about" className="nav-link">About</Link>
            <Link to="/contact" className="nav-link">Contact</Link>
          </div>

          {/* ── Right Side ───────────────────────────────────────────── */}
          <div className="hidden md:flex items-center gap-3">
            {!isAuthenticated ? (
              /* Guest: Login + Register buttons */
              <>
                <Link to="/login" className="btn-outline text-sm py-2 px-4">
                  Login
                </Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-4">
                  Register
                </Link>
              </>
            ) : (
              /* Authenticated: Profile dropdown */
              <div className="relative" ref={dropRef}>
                <button
                  onClick={() => setDropOpen((v) => !v)}
                  className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl hover:bg-gray-50 transition-colors duration-200 group"
                  aria-expanded={dropOpen}
                  aria-haspopup="true"
                >
                  {/* Avatar */}
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-9 h-9 rounded-full object-cover border-2 border-brand-300"
                    />
                  ) : (
                    <DefaultAvatar />
                  )}
                  {/* Name */}
                  <span className="text-sm font-semibold text-gray-700 group-hover:text-brand-700 transition-colors max-w-[120px] truncate">
                    {user?.name}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`text-gray-500 transition-transform duration-200 ${dropOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {/* ── Dropdown Menu ─────────────────────────────────── */}
                <div
                  className={`absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 transition-all duration-200 origin-top-right ${
                    dropOpen
                      ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                      : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                  }`}
                >
                  {/* User info header */}
                  <div className="px-4 py-2 border-b border-gray-100 mb-1">
                    <p className="text-xs text-gray-400 font-medium">Signed in as</p>
                    <p className="text-sm font-semibold text-gray-800 truncate">{user?.email}</p>
                  </div>

                  {/* My Profile */}
                  <DropItem icon={<User size={15} />} label="My Profile" to="/profile" onClick={() => setDropOpen(false)} />

                    {/* Customer Panel — only if roles includes 'customer' */}
                    {user?.roles?.includes("customer") && (
                    <DropItem
                      icon={<LayoutDashboard size={15} />}
                      label="Customer Panel"
                      to="/customer-panel"
                      onClick={() => setDropOpen(false)}
                    />
                  )}

                    {/* Seller Panel — only if roles includes 'seller' */}
                    {user?.roles?.includes("seller") && (
                    <DropItem
                      icon={<Store size={15} />}
                      label="Seller Panel"
                      to="/seller-panel"
                      onClick={() => setDropOpen(false)}
                    />
                  )}

                    {/* Admin Panel — only if roles includes 'admin' */}
                    {user?.roles?.includes("admin") && (
                    <DropItem
                      icon={<ShieldCheck size={15} />}
                      label="Admin Panel"
                      to="/admin-panel"
                      onClick={() => setDropOpen(false)}
                    />
                  )}

                  {/* Logout */}
                  <div className="border-t border-gray-100 mt-1 pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 font-medium transition-colors duration-150"
                    >
                      <LogOut size={15} />
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Mobile hamburger ─────────────────────────────────────── */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-600 hover:text-brand-700 hover:bg-gray-50 transition-colors"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* ── Mobile Menu ────────────────────────────────────────────── */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ${
            mobileOpen ? "max-h-screen pb-4" : "max-h-0"
          }`}
        >
          <div className="flex flex-col gap-1 pt-2 border-t border-gray-100">
            <MobileLink to="/" label="Home" onClick={() => setMobileOpen(false)} />
            <MobileLink to="/properties" label="Properties" onClick={() => setMobileOpen(false)} />
            <MobileLink to="/about" label="About" onClick={() => setMobileOpen(false)} />
            <MobileLink to="/contact" label="Contact" onClick={() => setMobileOpen(false)} />

            {!isAuthenticated ? (
              <div className="flex flex-col gap-2 mt-3">
                <Link to="/login" className="btn-outline text-center text-sm" onClick={() => setMobileOpen(false)}>Login</Link>
                <Link to="/register" className="btn-primary text-center text-sm" onClick={() => setMobileOpen(false)}>Register</Link>
              </div>
            ) : (
              <div className="mt-3 border-t border-gray-100 pt-3 flex flex-col gap-1">
                <div className="flex items-center gap-3 px-2 py-2">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full object-cover border-2 border-brand-300" />
                  ) : (
                    <DefaultAvatar />
                  )}
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
                    <p className="text-xs text-gray-400">{user?.email}</p>
                  </div>
                </div>
                <MobileLink to="/profile" label="My Profile" onClick={() => setMobileOpen(false)} />
                  {user?.roles?.includes("customer") && <MobileLink to="/customer-panel" label="Customer Panel" onClick={() => setMobileOpen(false)} />}
                  {user?.roles?.includes("seller") && <MobileLink to="/seller-panel" label="Seller Panel" onClick={() => setMobileOpen(false)} />}
                  {user?.roles?.includes("admin") && <MobileLink to="/admin-panel" label="Admin Panel" onClick={() => setMobileOpen(false)} />}
                <button
                  onClick={async () => { await logout(); setMobileOpen(false); navigate("/"); }}
                  className="mt-1 flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-red-500 hover:bg-red-50 font-medium transition-colors"
                >
                  <LogOut size={15} /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

// ── Helper sub-components ────────────────────────────────────────────────
const DropItem = ({ icon, label, to, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-brand-50 hover:text-brand-700 font-medium transition-colors duration-150"
  >
    <span className="text-gray-400">{icon}</span>
    {label}
  </Link>
);

const MobileLink = ({ to, label, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className="px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-brand-50 hover:text-brand-700 transition-colors"
  >
    {label}
  </Link>
);

export default Navbar;
