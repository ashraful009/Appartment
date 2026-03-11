import React, { useEffect, useState } from "react";
import axios from "axios";
import RoleToggles, { ALL_ROLES } from "../../components/admin/users/RoleToggles";

const UserManagement = () => {
  const [users, setUsers]                   = useState([]);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState("");
  const [currentAdminId, setCurrentAdminId] = useState(null);
  const [savingToggle, setSavingToggle]     = useState({});

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const [usersRes, meRes] = await Promise.all([
          axios.get("/api/admin/users", { withCredentials: true }),
          axios.get("/api/auth/me",     { withCredentials: true }),
        ]);
        setUsers(usersRes.data.users);
        setCurrentAdminId(meRes.data.user._id);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load users.");
      } finally { setLoading(false); }
    };
    fetchUsers();
  }, []);

  const handleToggle = async (user, roleKey) => {
    const toggleKey = `${user._id}-${roleKey}`;
    if (savingToggle[toggleKey]) return;

    const previousRoles  = user.roles || ["user"];
    const isCurrentlyOn  = previousRoles.includes(roleKey);
    const newRoles       = isCurrentlyOn
      ? previousRoles.filter(r => r !== roleKey)
      : [...previousRoles, roleKey];
    const safeNewRoles   = newRoles.includes("user") ? newRoles : ["user", ...newRoles];

    setSavingToggle(prev => ({ ...prev, [toggleKey]: true }));
    try {
      await axios.put(`/api/admin/users/${user._id}/roles`, { roles: safeNewRoles }, { withCredentials: true });
      setUsers(prev => prev.map(u => u._id === user._id ? { ...u, roles: safeNewRoles } : u));
    } catch {
      // state not updated → toggle reverts automatically
    } finally {
      setSavingToggle(prev => { const next = { ...prev }; delete next[toggleKey]; return next; });
    }
  };

  if (loading) return (
    <div className="p-8 space-y-3">
      <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse mb-6" />
      {[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}
    </div>
  );

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-gray-800">Manage Users</h1>
        <p className="text-gray-500 text-sm mt-1">
          {users.length} total users · Toggle switches to assign / revoke roles instantly.
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>
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
                <th className="text-left px-5 py-3.5 font-semibold text-gray-600 whitespace-nowrap">Role Toggles</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map(user => (
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
                        {user._id === currentAdminId && <p className="text-xs text-brand-500 font-medium">You</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-gray-500 max-w-[200px] truncate">{user.email}</td>
                  <td className="px-5 py-4 text-gray-500 whitespace-nowrap">
                    {user.phone ?? <span className="text-gray-300 italic text-xs">N/A</span>}
                  </td>
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
            <span className={`w-5 h-2.5 rounded-full ${trackOn} opacity-80`} /> {label}
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
