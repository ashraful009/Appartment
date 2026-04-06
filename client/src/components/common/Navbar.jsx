import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  ChevronDown,
  User,
  LayoutDashboard,
  Store,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  Building2,
  Briefcase,
  TrendingUp,
} from "lucide-react";

/* ─── Default avatar ───────────────────────────────────────────────────── */
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

/* ─── Desktop nav link ─────────────────────────────────────────────────── */
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
        letterSpacing: "0.035em",
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
      <style>{`
        a:hover .nav-underline { width: 100% !important; }
        a:hover { color: #C9942A !important; }
      `}</style>
    </Link>
  );
};

/* ─── Dropdown item ────────────────────────────────────────────────────── */
const DropItem = ({ icon, label, to, onClick }) => (
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
      e.currentTarget.style.color = "#0A1628";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = "transparent";
    }}
  >
    <span style={{ color: "#C9942A", flexShrink: 0 }}>{icon}</span>
    {label}
  </Link>
);

/* ─── Mobile link ──────────────────────────────────────────────────────── */
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

/* ─── Main Navbar ──────────────────────────────────────────────────────── */
const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [dropOpen, setDropOpen]     = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled]     = useState(false);
  const dropRef = useRef(null);

  // Scroll awareness
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close mobile menu on route change
  const location = useLocation();
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

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
        background: scrolled
          ? "rgba(250, 247, 240, 0.95)"
          : "rgba(250, 247, 240, 1)",
        backdropFilter: scrolled ? "blur(20px) saturate(1.5)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(20px) saturate(1.5)" : "none",
        borderBottom: scrolled
          ? "1px solid rgba(201,148,42,0.2)"
          : "1px solid rgba(232,223,200,0.7)",
        boxShadow: scrolled ? "0 4px 32px rgba(10,22,40,0.10)" : "none",
      }}
    >
      {/* Gold top accent — only on scroll */}
      {scrolled && (
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(201,148,42,0.5) 30%, rgba(232,184,75,0.8) 50%, rgba(201,148,42,0.5) 70%, transparent 100%)",
          }}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between" style={{ height: "72px" }}>

          {/* ── Logo ──────────────────────────────────────────────── */}
          <Link to="/" className="flex items-center gap-3 group" style={{ textDecoration: "none" }}>
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-105"
              style={{
                background: "linear-gradient(135deg, #040810 0%, #0A1628 60%, #122040 100%)",
                boxShadow: "0 4px 16px rgba(4,8,16,0.25), 0 0 0 1px rgba(201,148,42,0.25)",
              }}
            >
              <Building2 size={20} style={{ color: "#C9942A" }} />
            </div>
            <div className="leading-none">
              <span
                className="block font-serif font-semibold tracking-tight transition-colors duration-200 group-hover:text-gold-600"
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: "1.2rem",
                  fontWeight: 700,
                  color: "#0A1628",
                  letterSpacing: "-0.01em",
                }}
              >
                Nirapod Nibash
              </span>
              <span
                className="block uppercase"
                style={{
                  fontFamily: "'Jost', sans-serif",
                  fontSize: "9px",
                  fontWeight: 700,
                  letterSpacing: "0.2em",
                  color: "#C9942A",
                }}
              >
                Premium Real Estate
              </span>
            </div>
          </Link>

          {/* ── Center Nav (Desktop) ───────────────────────────────── */}
          <div className="hidden md:flex items-center gap-8">
            <NavLink to="/">Home</NavLink>
            <NavLink to="/properties">Properties</NavLink>
            <NavLink to="/about">About</NavLink>
            <NavLink to="/contact">Contact</NavLink>
          </div>

          {/* ── Right: Auth ──────────────────────────────────────────── */}
          <div className="hidden md:flex items-center gap-3">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/login"
                  className="btn-outline"
                  style={{ padding: "0.5rem 1.25rem", fontSize: "0.875rem" }}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn-gold"
                  style={{ padding: "0.5rem 1.25rem", fontSize: "0.875rem" }}
                >
                  Get Started
                </Link>
              </>
            ) : (
              <div className="relative" ref={dropRef}>
                <button
                  onClick={() => setDropOpen((v) => !v)}
                  className="flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 transition-all duration-200"
                  style={{
                    background: dropOpen ? "rgba(201,148,42,0.08)" : "transparent",
                    border: "1.5px solid transparent",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(201,148,42,0.06)";
                    e.currentTarget.style.borderColor = "rgba(201,148,42,0.2)";
                  }}
                  onMouseLeave={(e) => {
                    if (!dropOpen) {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.borderColor = "transparent";
                    }
                  }}
                  aria-expanded={dropOpen}
                >
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-9 h-9 rounded-full object-cover"
                      style={{ border: "2px solid rgba(201,148,42,0.4)", boxShadow: "0 2px 8px rgba(201,148,42,0.2)" }}
                    />
                  ) : (
                    <DefaultAvatar name={user?.name} />
                  )}
                  <span
                    className="max-w-[120px] truncate transition-colors"
                    style={{
                      fontFamily: "'Jost', sans-serif",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      color: "#0A1628",
                    }}
                  >
                    {user?.name}
                  </span>
                  <ChevronDown
                    size={15}
                    style={{
                      color: "#8B7E6A",
                      transition: "transform 0.2s",
                      transform: dropOpen ? "rotate(180deg)" : "rotate(0deg)",
                    }}
                  />
                </button>

                {/* Dropdown */}
                <div
                  className="absolute right-0 mt-3 w-60 rounded-2xl py-2 transition-all duration-200 origin-top-right"
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid rgba(232,223,200,0.8)",
                    boxShadow: "0 20px 60px rgba(10,22,40,0.15), 0 0 0 1px rgba(201,148,42,0.08)",
                    opacity: dropOpen ? 1 : 0,
                    transform: dropOpen ? "scale(1) translateY(0)" : "scale(0.95) translateY(-8px)",
                    pointerEvents: dropOpen ? "auto" : "none",
                  }}
                >
                  {/* Header */}
                  <div
                    className="px-4 py-3 mb-1 rounded-xl mx-2"
                    style={{
                      background: "linear-gradient(135deg, rgba(201,148,42,0.06), rgba(232,184,75,0.03))",
                      borderBottom: "1px solid rgba(201,148,42,0.12)",
                      marginBottom: "6px",
                    }}
                  >
                    <p style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#C9942A", marginBottom: "2px" }}>
                      Signed in as
                    </p>
                    <p style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#0A1628", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {user?.email}
                    </p>
                  </div>

                  <DropItem icon={<User size={14} />}            label="My Profile"       to="/profile"       onClick={() => setDropOpen(false)} />
                  {user?.roles?.includes("customer")   && <DropItem icon={<LayoutDashboard size={14} />}  label="Customer Panel"   to="/customer-panel" onClick={() => setDropOpen(false)} />}
                  {user?.roles?.includes("seller")     && <DropItem icon={<Store size={14} />}            label="Seller Panel"     to="/seller-panel"   onClick={() => setDropOpen(false)} />}
                  {user?.roles?.includes("admin")      && <DropItem icon={<ShieldCheck size={14} />}      label="Admin Panel"      to="/admin-panel"    onClick={() => setDropOpen(false)} />}
                  {user?.roles?.includes("Director")   && <DropItem icon={<Briefcase size={14} />}        label="Director Panel"   to="/director"       onClick={() => setDropOpen(false)} />}
                  {user?.roles?.includes("GM")         && <DropItem icon={<TrendingUp size={14} />}       label="GM Panel"         to="/gm"             onClick={() => setDropOpen(false)} />}
                  {user?.roles?.includes("AGM")        && <DropItem icon={<TrendingUp size={14} />}       label="AGM Panel"        to="/agm"            onClick={() => setDropOpen(false)} />}
                  {user?.roles?.includes("Accountant") && <DropItem icon={<ShieldCheck size={14} />}      label="Accountant Panel" to="/accountant"     onClick={() => setDropOpen(false)} />}

                  <div style={{ borderTop: "1px solid rgba(232,223,200,0.7)", marginTop: "6px", paddingTop: "6px" }}>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full rounded-xl mx-2 px-3 py-2.5 transition-all duration-200"
                      style={{
                        fontFamily: "'Jost', sans-serif",
                        fontSize: "0.8125rem",
                        fontWeight: 500,
                        color: "#DC2626",
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        width: "calc(100% - 16px)",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(220,38,38,0.06)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                    >
                      <LogOut size={14} />
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Mobile Hamburger ──────────────────────────────────────── */}
          <button
            className="md:hidden rounded-xl p-2.5 transition-all duration-200"
            style={{
              color: "#0A1628",
              background: mobileOpen ? "rgba(201,148,42,0.08)" : "transparent",
              border: "1.5px solid",
              borderColor: mobileOpen ? "rgba(201,148,42,0.3)" : "rgba(232,223,200,0.8)",
              cursor: "pointer",
            }}
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* ── Mobile Menu ──────────────────────────────────────────────── */}
      <div
        className="md:hidden overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: mobileOpen ? "600px" : "0" }}
      >
        <div
          style={{
            borderTop: "1px solid rgba(201,148,42,0.12)",
            background: "#FEFDFB",
            padding: "12px 16px 20px",
          }}
        >
          {/* Nav links */}
          <div className="space-y-1 mb-4">
            <MobileLink to="/"           label="Home"       onClick={() => setMobileOpen(false)} />
            <MobileLink to="/properties" label="Properties" onClick={() => setMobileOpen(false)} />
            <MobileLink to="/about"      label="About"      onClick={() => setMobileOpen(false)} />
            <MobileLink to="/contact"    label="Contact"    onClick={() => setMobileOpen(false)} />
          </div>

          {!isAuthenticated ? (
            <div className="flex flex-col gap-2.5 pt-3" style={{ borderTop: "1px solid rgba(232,223,200,0.7)" }}>
              <Link to="/login"    className="btn-outline  text-center text-sm w-full" onClick={() => setMobileOpen(false)}>Login</Link>
              <Link to="/register" className="btn-gold     text-center text-sm w-full" onClick={() => setMobileOpen(false)}>Get Started</Link>
            </div>
          ) : (
            <div className="pt-3 space-y-1" style={{ borderTop: "1px solid rgba(232,223,200,0.7)" }}>
              {/* User info */}
              <div
                className="flex items-center gap-3 px-4 py-3 rounded-xl mb-3"
                style={{
                  background: "linear-gradient(135deg, rgba(201,148,42,0.07), rgba(232,184,75,0.03))",
                  border: "1px solid rgba(201,148,42,0.15)",
                }}
              >
                {user?.avatar
                  ? <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover" style={{ border: "2px solid rgba(201,148,42,0.4)" }} />
                  : <DefaultAvatar name={user?.name} />
                }
                <div>
                  <p style={{ fontSize: "0.875rem", fontWeight: 700, color: "#0A1628", fontFamily: "'Jost', sans-serif" }}>{user?.name}</p>
                  <p style={{ fontSize: "0.75rem", color: "#8B7E6A", fontFamily: "'Jost', sans-serif" }}>{user?.email}</p>
                </div>
              </div>

              <MobileLink to="/profile"       label="My Profile"       onClick={() => setMobileOpen(false)} />
              {user?.roles?.includes("customer")   && <MobileLink to="/customer-panel" label="Customer Panel"   onClick={() => setMobileOpen(false)} />}
              {user?.roles?.includes("seller")     && <MobileLink to="/seller-panel"   label="Seller Panel"     onClick={() => setMobileOpen(false)} />}
              {user?.roles?.includes("admin")      && <MobileLink to="/admin-panel"    label="Admin Panel"      onClick={() => setMobileOpen(false)} />}
              {user?.roles?.includes("Director")   && <MobileLink to="/director"       label="Director Panel"   onClick={() => setMobileOpen(false)} />}
              {user?.roles?.includes("GM")         && <MobileLink to="/gm"             label="GM Panel"         onClick={() => setMobileOpen(false)} />}
              {user?.roles?.includes("AGM")        && <MobileLink to="/agm"            label="AGM Panel"        onClick={() => setMobileOpen(false)} />}
              {user?.roles?.includes("Accountant") && <MobileLink to="/accountant"     label="Accountant Panel" onClick={() => setMobileOpen(false)} />}

              <button
                onClick={async () => { await logout(); setMobileOpen(false); navigate("/"); }}
                className="flex items-center gap-2 px-4 py-3 rounded-xl w-full transition-all duration-200 mt-1"
                style={{
                  fontFamily: "'Jost', sans-serif",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "#DC2626",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(220,38,38,0.05)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
              >
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
