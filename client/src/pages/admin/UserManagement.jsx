import React, { useEffect, useState } from "react";
import axios from "axios";
import { CheckCircle, AlertCircle, X, ChevronDown } from "lucide-react";

const Toast = ({ type, msg, onClose }) => (
  <div className={`fixed bottom-6 right-6 z-50 flex items-start gap-3 px-5 py-4 rounded-2xl shadow-xl text-sm font-medium max-w-sm ${
    type === "success" ? "bg-emerald-50 border border-emerald-200 text-emerald-800" : "bg-red-50 border border-red-200 text-red-700"
  }`}>
    {type === "success" ? <CheckCircle size={18} className="flex-shrink-0 mt-0.5" /> : <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />}
    <span className="flex-1">{msg}</span>
    <button onClick={onClose}><X size={14} /></button>
  </div>
);

// All 4 roles definition
const ALL_ROLES = [
  { key: "user",     label: "User",     color: "bg-gray-100 text-gray-600",       dot: "bg-gray-400"    },
  { key: "customer", label: "Customer", color: "bg-blue-100 text-blue-700",        dot: "bg-blue-500"    },
  { key: "seller",   label: "Seller",   color: "bg-amber-100 text-amber-700",      dot: "bg-amber-500"   },
  { key: "admin",    label: "Admin",    color: "bg-brand-100 text-brand-700",      dot: "bg-brand-600"   },
];

// ── Role Badge component ─────────────────────────────────────────────────────
const RoleBadge = ({ roleKey }) => {
  const def = ALL_ROLES.find((r) => r.key === roleKey);
  if (!def) return null;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${def.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${def.dot}`} />
      {def.label}
    </span>
  );
};

// ── Inline 4-toggle role editor ──────────────────────────────────────────────
const RoleEditor = ({ userId, currentRoles, isSelf, onSave, saving }) => {
  const [open, setOpen]       = useState(false);
  const [selected, setSelected] = useState(currentRoles);

  // Keep in sync if parent updates
  useEffect(() => { setSelected(currentRoles); }, [currentRoles]);

  const toggle = (roleKey) => {
    // "user" is always required — cannot be removed
    if (roleKey === "user") return;
    // Cannot remove own admin role
    if (isSelf && roleKey === "admin") return;

    setSelected((prev) =>
      prev.includes(roleKey) ? prev.filter((r) => r !== roleKey) : [...prev, roleKey]
    );
  };

  const handleSave = () => {
    // Ensure "user" is always present
    const toSave = selected.includes("user") ? selected : ["user", ...selected];
    onSave(userId, toSave);
    setOpen(false);
  };

  const changed = JSON.stringify([...selected].sort()) !== JSON.stringify([...currentRoles].sort());

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-800 border border-gray-200 rounded-lg px-2.5 py-1.5 hover:border-gray-300 transition-colors"
      >
        Edit roles <ChevronDown size={12} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1.5 z-30 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 w-52">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Assign Roles</p>

          <div className="space-y-2">
            {ALL_ROLES.map(({ key, label, color, dot }) => {
              const isChecked  = selected.includes(key);
              const isDisabled = key === "user" || (isSelf && key === "admin");

              return (
                <label
                  key={key}
                  className={`flex items-center gap-3 cursor-pointer group ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <div
                    onClick={() => !isDisabled && toggle(key)}
                    className={`w-4 h-4 rounded flex items-center justify-center border-2 transition-colors flex-shrink-0 ${
                      isChecked
                        ? "bg-brand-600 border-brand-600"
                        : "border-gray-300 group-hover:border-brand-400"
                    }`}
                  >
                    {isChecked && (
                      <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <span className={`flex items-center gap-1.5 text-sm ${isChecked ? "font-semibold text-gray-800" : "text-gray-500"}`}>
                    <span className={`w-2 h-2 rounded-full ${dot}`} />
                    {label}
                    {isDisabled && <span className="text-xs text-gray-400">(locked)</span>}
                  </span>
                </label>
              );
            })}
          </div>

          <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
            <button
              onClick={handleSave}
              disabled={!changed || saving}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                changed && !saving
                  ? "bg-brand-600 text-white hover:bg-brand-700"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              {saving ? "Saving…" : "Save"}
            </button>
            <button
              onClick={() => { setSelected(currentRoles); setOpen(false); }}
              className="flex-1 py-1.5 rounded-lg text-xs font-medium text-gray-500 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Main Component ───────────────────────────────────────────────────────────
const UserManagement = () => {
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState({}); // { userId: true }
  const [toast, setToast]       = useState(null);
  const [error, setError]       = useState("");
  const [currentAdminId, setCurrentAdminId] = useState(null);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const [usersRes, meRes] = await Promise.all([
          axios.get("/api/admin/users",  { withCredentials: true }),
          axios.get("/api/auth/me",      { withCredentials: true }),
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

  const handleSaveRoles = async (userId, newRoles) => {
    setSaving((p) => ({ ...p, [userId]: true }));
    try {
      const { data } = await axios.put(
        `/api/admin/users/${userId}/roles`,
        { roles: newRoles },
        { withCredentials: true }
      );
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, roles: data.user.roles } : u))
      );
      showToast("success", `Roles updated for ${data.user.name}.`);
    } catch (err) {
      showToast("error", err?.response?.data?.message || "Failed to update roles.");
    } finally {
      setSaving((p) => ({ ...p, [userId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="p-8 space-y-3">
        <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse mb-6" />
        {[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}
      </div>
    );
  }

  return (
    <div className="p-8">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-gray-800">Manage Users</h1>
        <p className="text-gray-500 text-sm mt-1">
          {users.length} total users · Click "Edit roles" on any row to assign roles.
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-2 mb-5">
        {ALL_ROLES.map((r) => (
          <span key={r.key} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${r.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${r.dot}`} />
            {r.label}
          </span>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-5 py-3.5 font-semibold text-gray-600">User</th>
                <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Email</th>
                <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Current Roles</th>
                <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50/70 transition-colors">
                  {/* Avatar + Name */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full object-cover border border-gray-200 flex-shrink-0" />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-sm flex-shrink-0">
                          {user.name?.[0]?.toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-gray-800 truncate max-w-[140px]">{user.name}</p>
                        {user._id === currentAdminId && (
                          <p className="text-xs text-brand-500 font-medium">You</p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="px-5 py-4 text-gray-500 max-w-[200px] truncate">{user.email}</td>

                  {/* Current Role Badges */}
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-1.5">
                      {(user.roles || ["user"]).map((r) => (
                        <RoleBadge key={r} roleKey={r} />
                      ))}
                    </div>
                  </td>

                  {/* Edit Roles dropdown */}
                  <td className="px-5 py-4">
                    <RoleEditor
                      userId={user._id}
                      currentRoles={user.roles || ["user"]}
                      isSelf={user._id === currentAdminId}
                      onSave={handleSaveRoles}
                      saving={!!saving[user._id]}
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
    </div>
  );
};

export default UserManagement;
