import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  ChevronDown, User, LogOut, Menu, X, Building2, Wallet
} from "lucide-react";
import { ROLE_LINKS } from "./Navbar/NavbarConfig";
import { DropItem } from "./Navbar/DropItem";

const DefaultAvatar = ({ name }) => (
  <div
    className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm select-none"
    style={{
      background: "linear-gradient(135deg, #122040 0%, #1A3060 60%, #C9942A 100%)",
      border: "2px solid rgba(201,148,42,0.5)",
      boxShadow: "0 2px 8px rgba(201,148,42,0.25)",
    }}
  >
    {name ? name[0].toUpperCase() : <User size={14} />}
  </div>
);

const NavLink = ({ to, children, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link
      to={to}
      onClick={onClick}
      className="relative transition-colors duration-200"
      style={{
        fontFamily: "'Jost', sans-serif",
        fontSize: "0.875rem",
        fontWeight: 500,
        color: isActive ? "#C9942A" : "#0A1628",
        textDecoration: "none",
      }}
    >
      {children}
      <span
        style={{
          position: "absolute",
          bottom: "-4px",
          left: 0,
          height: "2px",
          width: isActive ? "100%" : "0",
          borderRadius: "999px",
          background: "linear-gradient(90deg, #C9942A, #E8B84B)",
          transition: "width 0.3s ease",
        }}
        className="nav-underline"
      />
      <style>{`a:hover .nav-underline { width: 100% !important; } a:hover { color: #C9942A !important; }`}</style>
    </Link>
  );
};

const MobileLink = ({ to, label, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center px-4 py-3 rounded-xl transition-all duration-200"
      style={{
        fontFamily: "'Jost', sans-serif",
        fontSize: "0.9rem",
        fontWeight: isActive ? 600 : 500,
        color: isActive ? "#C9942A" : "#0A1628",
        background: isActive ? "rgba(201,148,42,0.07)" : "transparent",
        borderLeft: isActive ? "2px solid #C9942A" : "2px solid transparent",
        textDecoration: "none",
      }}
    >
      {label}
    </Link>
  );
};

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [dropOpen, setDropOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const location = useLocation();
  const [prevPath, setPrevPath] = useState(location.pathname);
  if (prevPath !== location.pathname) {
    setPrevPath(location.pathname);
    setMobileOpen(false);
  }

  const handleLogout = async () => {
    await logout();
    setDropOpen(false);
    navigate("/");
  };

  return (
    <nav
      className="sticky z-40 transition-all duration-300"
      style={{
        top: "var(--topbar-h, 40px)",
        background: scrolled ? "rgba(250, 247, 240, 0.95)" : "rgba(250, 247, 240, 1)",
        backdropFilter: scrolled ? "blur(20px) saturate(1.5)" : "none",
        borderBottom: scrolled ? "1px solid rgba(201,148,42,0.2)" : "1px solid rgba(232,223,200,0.7)",
        boxShadow: scrolled ? "0 4px 32px rgba(10,22,40,0.10)" : "none",
      }}
    >
      <div className="w-full xl:w-[80%] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between" style={{ height: "72px" }}>
          
          <Link to="/" className="flex items-center gap-3 group" style={{ textDecoration: "none" }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gray-900 border border-yellow-500">
              <Building2 size={20} style={{ color: "#C9942A" }} />
            </div>
            <div className="leading-none">
              <span className="block font-serif font-semibold text-gray-900 text-lg">Nirapod Nibash</span>
              <span className="block uppercase text-yellow-600 text-[9px] tracking-widest">Premium Real Estate</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <NavLink to="/">Home</NavLink>
            <NavLink to="/properties">Properties</NavLink>
            <NavLink to="/about">About</NavLink>
            <NavLink to="/contact">Contact</NavLink>
          </div>

          <div className="hidden md:flex items-center gap-3">
            {!isAuthenticated ? (
              <>
                <Link to="/login" className="btn-outline px-5 py-2 text-sm">Login</Link>
                <Link to="/register" className="btn-gold px-5 py-2 text-sm">Get Started</Link>
              </>
            ) : (
              <div className="relative" ref={dropRef}>
                <button
                  onClick={() => setDropOpen((v) => !v)}
                  className="flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 transition-all hover:bg-yellow-50"
                >
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full object-cover border-2 border-yellow-500" />
                  ) : <DefaultAvatar name={user?.name} />}
                  <span className="max-w-[120px] truncate text-sm font-semibold">{user?.name}</span>
                  <ChevronDown size={15} />
                </button>

                {dropOpen && (
                  <div className="absolute right-0 mt-3 w-60 rounded-2xl py-2 bg-white shadow-xl border border-yellow-100">
                    <div className="px-4 py-3 mb-1 mx-2 bg-yellow-50 rounded-xl border-b border-yellow-100">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-yellow-600">Signed in as</p>
                      <p className="text-sm font-semibold truncate text-gray-900">{user?.email}</p>
                    </div>

                    <DropItem icon={<User size={14} />} label="My Profile" to="/profile" onClick={() => setDropOpen(false)} />
                    {!user?.roles?.includes("member") && !user?.roles?.includes("Investor") && (
                      <DropItem icon={<Wallet size={14} />} label="My Investment" to="/membership" onClick={() => setDropOpen(false)} />
                    )}
                    
                    {ROLE_LINKS.map((link) => 
                      user?.roles?.includes(link.role) && (
                        <DropItem key={link.role} icon={link.icon} label={link.label} to={link.to} onClick={() => setDropOpen(false)} />
                      )
                    )}

                    <div className="border-t border-gray-100 mt-2 pt-2 mx-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-3 py-2 text-red-600 hover:bg-red-50 rounded-xl text-sm font-medium"
                      >
                        <LogOut size={14} /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <button className="md:hidden p-2" onClick={() => setMobileOpen((v) => !v)}>
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-white border-t p-4 space-y-1">
          <MobileLink to="/" label="Home" onClick={() => setMobileOpen(false)} />
          <MobileLink to="/properties" label="Properties" onClick={() => setMobileOpen(false)} />
          <MobileLink to="/about" label="About" onClick={() => setMobileOpen(false)} />
          
          {!isAuthenticated ? (
            <div className="flex flex-col gap-2 pt-3 border-t mt-3">
              <Link to="/login" className="btn-outline text-center w-full" onClick={() => setMobileOpen(false)}>Login</Link>
              <Link to="/register" className="btn-gold text-center w-full" onClick={() => setMobileOpen(false)}>Get Started</Link>
            </div>
          ) : (
            <div className="pt-3 border-t mt-3 space-y-1">
              <div className="flex items-center gap-3 px-4 py-3 bg-yellow-50 rounded-xl mb-3 border border-yellow-100">
                {user?.avatar ? <img src={user.avatar} className="w-10 h-10 rounded-full" /> : <DefaultAvatar name={user?.name} />}
                <div>
                  <p className="font-bold text-gray-900 text-sm">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
              </div>
              
              <MobileLink to="/profile" label="My Profile" onClick={() => setMobileOpen(false)} />
              {!user?.roles?.includes("member") && !user?.roles?.includes("Investor") && (
                <MobileLink to="/membership" label="My Investment" onClick={() => setMobileOpen(false)} />
              )}
              
              {ROLE_LINKS.map((link) => 
                user?.roles?.includes(link.role) && (
                  <MobileLink key={link.role} to={link.to} label={link.label} onClick={() => setMobileOpen(false)} />
                )
              )}

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-3 w-full text-red-600 hover:bg-red-50 rounded-xl font-semibold mt-2"
              >
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
