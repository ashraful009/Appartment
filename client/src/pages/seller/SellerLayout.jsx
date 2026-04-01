import React, { useEffect, useState, useRef, useCallback } from "react";
import { NavLink, Outlet, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import {
  LayoutDashboard, UserCheck, LogOut, ChevronRight, Users2,
  Bell, X, Megaphone, AlertCircle, CheckCheck, Loader2, Copy, User, Building2, Monitor
} from "lucide-react";


const navItems = [
  { to: "/seller-panel", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/seller-panel/assigned", label: "Assigned Leads", icon: UserCheck },
  { to: "/seller-panel/my-team", label: "My Team", icon: Users2 },
  { to: "/seller-panel/book-unit", label: "Book Unit", icon: Building2 },
  { to: "/seller-panel/my-sales", label: "My Sales & Monitoring", icon: Monitor },
  { to: "/seller-panel/profile", label: "My Profile", icon: User },
];

// ── Notification type → styles -------------------------------------------------
const TYPE_META = {
  Broadcast: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", icon: <Megaphone size={13} className="text-blue-500 flex-shrink-0" /> },
  MentorRequest: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", icon: <AlertCircle size={13} className="text-amber-500 flex-shrink-0" /> },
  LeadDelegated: { bg: "bg-green-50", border: "border-green-200", text: "text-green-700", icon: <CheckCheck size={13} className="text-green-500 flex-shrink-0" /> },
  General: { bg: "bg-gray-50", border: "border-gray-200", text: "text-gray-600", icon: <Bell size={13} className="text-gray-400 flex-shrink-0" /> },
};

// ── Notification Bell ----------------------------------------------------------
const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [marking, setMarking] = useState(false);
  const panelRef = useRef(null);

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/seller/notifications", { withCredentials: true });
      setNotes(data.notifications);
    } catch { /* silently fail */ }
    finally { setLoading(false); }
  }, []);

  // Poll every 60 s
  useEffect(() => {
    fetchNotes();
    const timer = setInterval(fetchNotes, 60_000);
    return () => clearInterval(timer);
  }, [fetchNotes]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleMarkAllRead = async () => {
    setMarking(true);
    try {
      await axios.put("/api/seller/notifications/mark-read", {}, { withCredentials: true });
      setNotes([]);
    } catch { /* silently fail */ }
    finally { setMarking(false); }
  };

  const unreadCount = notes.length;

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <button
        onClick={() => { setOpen(o => !o); if (!open) fetchNotes(); }}
        className="relative w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
        title="Notifications"
      >
        <Bell size={17} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute top-10 right-0 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
              Notifications {unreadCount > 0 && <span className="text-red-500">({unreadCount})</span>}
            </p>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  disabled={marking}
                  className="text-xs text-brand-600 hover:text-brand-800 font-semibold px-2 py-1 rounded-lg hover:bg-brand-50 transition-colors flex items-center gap-1"
                >
                  {marking ? <Loader2 size={11} className="animate-spin" /> : <CheckCheck size={11} />}
                  Mark all read
                </button>
              )}
              <button onClick={() => setOpen(false)} className="p-1 rounded-lg hover:bg-gray-200 text-gray-400">
                <X size={13} />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 size={18} className="animate-spin text-brand-500" />
              </div>
            ) : notes.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <Bell size={28} className="mx-auto mb-2 opacity-30" />
                <p className="text-xs">All caught up — no new messages.</p>
              </div>
            ) : (
              notes.map(n => {
                const meta = TYPE_META[n.type] || TYPE_META.General;
                const timeAgo = (() => {
                  const diff = Date.now() - new Date(n.createdAt).getTime();
                  const m = Math.floor(diff / 60000);
                  if (m < 1) return "just now";
                  if (m < 60) return `${m}m ago`;
                  const h = Math.floor(m / 60);
                  if (h < 24) return `${h}h ago`;
                  return `${Math.floor(h / 24)}d ago`;
                })();

                return (
                  <div key={n._id} className={`px-4 py-3 ${meta.bg} border-l-4 ${meta.border}`}>
                    <div className="flex items-start gap-2">
                      {meta.icon}
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-semibold ${meta.text} mb-0.5`}>{n.type}</p>
                        <p className="text-xs text-gray-700 leading-relaxed">{n.message}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-gray-400">{timeAgo}</span>
                          {n.senderId?.name && (
                            <span className="text-[10px] text-gray-400">· from {n.senderId.name}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ── Main Layout ----------------------------------------------------------------
const SellerLayout = () => {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [copiedCode, setCopiedCode] = useState(false);

  const handleCopyCode = async () => {
    const code = user?.referralCode;
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      // Fallback for older browsers
      const el = document.createElement("textarea");
      el.value = code;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

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
        {/* Seller info + notification bell */}
        <div className="px-6 py-5 border-b border-gray-700 flex items-center justify-between">
          <div className="min-w-0 flex-1 mr-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Seller Panel</p>
            <p className="text-sm font-semibold text-white mt-0.5 truncate">{user?.name}</p>

            {/* ── Referral Code Badge ── */}
            {user?.referralCode && (
              <div className="flex items-center gap-1 mt-1.5">
                <span className="bg-gray-800 text-amber-300 text-xs font-mono px-2 py-0.5 rounded tracking-widest border border-gray-700">
                  {user.referralCode}
                </span>
                <button
                  onClick={handleCopyCode}
                  title="Copy referral code"
                  className="w-5 h-5 flex items-center justify-center rounded text-gray-400 hover:text-amber-300 hover:bg-gray-700 transition-colors"
                >
                  {copiedCode
                    ? <CheckCheck size={11} className="text-emerald-400" />
                    : <Copy size={11} />}
                </button>
              </div>
            )}
          </div>
          <NotificationBell />
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
