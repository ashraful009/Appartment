import React, { useEffect, useState } from "react";
import axios from "axios";
import { CheckCircle, AlertCircle, X } from "lucide-react";

// ── Toast ─────────────────────────────────────────────────────────────────────
const Toast = ({ type, msg, onClose }) => (
  <div
    className={`fixed bottom-6 right-6 z-50 flex items-start gap-3 px-5 py-4 rounded-2xl shadow-xl text-sm font-medium max-w-sm ${type === "success"
      ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
      : "bg-red-50 border border-red-200 text-red-700"
      }`}
  >
    {type === "success" ? (
      <CheckCircle size={18} className="flex-shrink-0 mt-0.5" />
    ) : (
      <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
    )}
    <span className="flex-1">{msg}</span>
    <button onClick={onClose}>
      <X size={14} />
    </button>
  </div>
);

// ── Role definitions ──────────────────────────────────────────────────────────
const ALL_ROLES = [
  {
    key: "user",
    label: "User",
    trackOn: "bg-gray-400",
    trackOff: "bg-gray-200",
  },
  {
    key: "customer",
    label: "Customer",
    trackOn: "bg-blue-500",
    trackOff: "bg-gray-200",
  },
  {
    key: "seller",
    label: "Seller",
    trackOn: "bg-amber-500",
    trackOff: "bg-gray-200",
  },
  {
    key: "admin",
    label: "Admin",
    trackOn: "bg-brand-600",
    trackOff: "bg-gray-200",
  },
];

// ── Single Toggle Switch ──────────────────────────────────────────────────────
/**
 * Props:
 *  - isOn       {boolean}
 *  - isLoading  {boolean}  – show spinner, disable interaction
 *  - isDisabled {boolean}  – locked (e.g. "user" role always on, self-admin)
 *  - trackOn    {string}   – Tailwind class for active track colour
 *  - trackOff   {string}   – Tailwind class for inactive track colour
 *  - label      {string}
 *  - onClick    {function}
 */
const Toggle = ({ isOn, isLoading, isDisabled, trackOn, trackOff, label, onClick }) => {
  const active = isOn;
  const locked = isDisabled || isLoading;

  return (
    <div className="flex flex-col items-center gap-1 min-w-[52px]">
      <button
        type="button"
        onClick={locked ? undefined : onClick}
        aria-label={`${label} – ${active ? "on" : "off"}`}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 ${locked ? "cursor-not-allowed opacity-60" : "cursor-pointer"
          } ${active ? trackOn : trackOff}`}
      >
        {isLoading ? (
          /* Spinner replaces thumb while saving */
          <span className="absolute inset-0 flex items-center justify-center">
            <svg
              className="w-3.5 h-3.5 text-white animate-spin"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              />
            </svg>
          </span>
        ) : (
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${active ? "translate-x-6" : "translate-x-1"
              }`}
          />
        )}
      </button>
      <span
        className={`text-[10px] font-semibold uppercase tracking-wide leading-none ${active ? "text-gray-700" : "text-gray-400"
          }`}
      >
        {label}
      </span>
    </div>
  );
};

// ── Role Toggles row for one user ─────────────────────────────────────────────
/**
 * Props:
 *  - user            {object}   – the full user object from state
 *  - isSelf          {boolean}
 *  - savingToggle    {object}   – { [userId-roleKey]: true } map
 *  - onToggle        {function} – (user, roleKey) => void
 */
const RoleToggles = ({ user, isSelf, savingToggle, onToggle }) => {
  const roles = user.roles || ["user"];

  return (
    <div className="flex items-start gap-3 flex-wrap">
      {ALL_ROLES.map(({ key, label, trackOn, trackOff }) => {
        const isOn = roles.includes(key);
        const isLoading = !!savingToggle[`${user._id}-${key}`];
        // "user" is always locked on; self-admin cannot revoke own admin
        const isDisabled = key === "user" || (isSelf && key === "admin");

        return (
          <Toggle
            key={key}
            isOn={isOn}
            isLoading={isLoading}
            isDisabled={isDisabled}
            trackOn={trackOn}
            trackOff={trackOff}
            label={label}
            onClick={() => onToggle(user, key)}
          />
        );
      })}
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentAdminId, setCurrentAdminId] = useState(null);
  const [toast, setToast] = useState(null);

  // Fine-grained loading: keyed by `userId-roleKey`
  const [savingToggle, setSavingToggle] = useState({});

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Fetch users on mount ──────────────────────────────────────────────────
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const [usersRes, meRes] = await Promise.all([
          axios.get("/api/admin/users", { withCredentials: true }),
          axios.get("/api/auth/me", { withCredentials: true }),
        ]);
        setUsers(usersRes.data.users);
        setCurrentAdminId(meRes.data.user._id);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load users.");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // ── Handle a single role toggle click ────────────────────────────────────
  const handleToggle = async (user, roleKey) => {
    const toggleKey = `${user._id}-${roleKey}`;

    // Guard: already saving this specific toggle
    if (savingToggle[toggleKey]) return;

    const previousRoles = user.roles || ["user"];
    const isCurrentlyOn = previousRoles.includes(roleKey);

    // Compute new roles array
    const newRoles = isCurrentlyOn
      ? previousRoles.filter((r) => r !== roleKey)   // remove
      : [...previousRoles, roleKey];                  // add

    // Always keep "user" role
    const safeNewRoles = newRoles.includes("user") ? newRoles : ["user", ...newRoles];

    // ── Mark this specific toggle as loading ──────────────────────────────
    setSavingToggle((prev) => ({ ...prev, [toggleKey]: true }));

    try {
      await axios.put(
        `/api/admin/users/${user._id}/roles`,
        { roles: safeNewRoles },
        { withCredentials: true }
      );

      // ✅ Fix: update local React state INSIDE .then() so UI stays in sync
      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          u._id === user._id ? { ...u, roles: safeNewRoles } : u
        )
      );

      showToast(
        "success",
        `${roleKey.charAt(0).toUpperCase() + roleKey.slice(1)} role ${isCurrentlyOn ? "removed from" : "added to"
        } ${user.name}.`
      );
    } catch (err) {
      // ❌ Revert: do NOT update state, so toggle snaps back automatically
      showToast(
        "error",
        err?.response?.data?.message ||
        `Failed to update ${roleKey} role for ${user.name}.`
      );
    } finally {
      setSavingToggle((prev) => {
        const next = { ...prev };
        delete next[toggleKey];
        return next;
      });
    }
  };

  // ── Skeleton loader ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="p-8 space-y-3">
        <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse mb-6" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="p-8">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-gray-800">Manage Users</h1>
        <p className="text-gray-500 text-sm mt-1">
          {users.length} total users · Toggle switches to assign / revoke roles instantly.
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-5 py-3.5 font-semibold text-gray-600">User</th>
                <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Email</th>
                <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Phone</th>
                <th className="text-left px-5 py-3.5 font-semibold text-gray-600 whitespace-nowrap">
                  Role Toggles
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50/70 transition-colors">
                  {/* Avatar + Name */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-9 h-9 rounded-full object-cover border border-gray-200 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-sm flex-shrink-0">
                          {user.name?.[0]?.toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-gray-800 truncate max-w-[140px]">
                          {user.name}
                        </p>
                        {user._id === currentAdminId && (
                          <p className="text-xs text-brand-500 font-medium">You</p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="px-5 py-4 text-gray-500 max-w-[200px] truncate">
                    {user.email}
                  </td>

                  {/* Phone */}
                  <td className="px-5 py-4 text-gray-500 whitespace-nowrap">
                    {user.phone ?? <span className="text-gray-300 italic text-xs">N/A</span>}
                  </td>

                  {/* Role Toggles */}
                  <td className="px-5 py-4">
                    <RoleToggles
                      user={user}
                      isSelf={user._id === currentAdminId}
                      savingToggle={savingToggle}
                      onToggle={handleToggle}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {users.length === 0 && (
            <div className="text-center py-16 text-gray-400">No users found.</div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-5 flex flex-wrap items-center gap-4 text-xs text-gray-500">
        {ALL_ROLES.map(({ key, label, trackOn }) => (
          <span key={key} className="flex items-center gap-1.5">
            <span className={`w-5 h-2.5 rounded-full ${trackOn} opacity-80`} />
            {label}
          </span>
        ))}
        <span className="ml-auto text-gray-400 italic">
          "User" role is permanent · Admins cannot revoke their own admin role
        </span>
      </div>
    </div>
  );
};

export default UserManagement;
