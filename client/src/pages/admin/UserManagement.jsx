import React, { useEffect, useState } from "react";
import axios from "axios";
import RoleToggles, { ALL_ROLES } from "../../components/admin/users/RoleToggles";
import { Edit2, X } from "lucide-react";
const UserManagement = () => {
  const [users, setUsers]                   = useState([]);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState("");
  const [currentAdminId, setCurrentAdminId] = useState(null);
  const [savingToggle, setSavingToggle]     = useState(false);
  const [editingUser, setEditingUser]       = useState(null);
  const [tempRoles, setTempRoles]           = useState([]);

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

  const openEditModal = (user) => {
    setEditingUser(user);
    setTempRoles(user.roles || ["user"]);
  };

  const handleToggleRole = (roleKey) => {
    setTempRoles(prev => {
      let next = prev.includes(roleKey) ? prev.filter(r => r !== roleKey) : [...prev, roleKey];
      // Auto-remove 'user' if there are other roles, ensure 'user' if none
      const nonUserRoles = next.filter(r => r !== "user");
      return nonUserRoles.length > 0 ? nonUserRoles : ["user"];
    });
  };

  const saveRoles = async () => {
    if (!editingUser) return;
    setSavingToggle(true);
    try {
      await axios.put(`/api/admin/users/${editingUser._id}/roles`, { roles: tempRoles }, { withCredentials: true });
      setUsers(prev => prev.map(u => u._id === editingUser._id ? { ...u, roles: tempRoles } : u));
      setEditingUser(null);
    } catch (err) {
      alert("Failed to update roles");
    } finally {
      setSavingToggle(false);
    }
  };

  const getRoleColor = (roleKey) => {
    const found = ALL_ROLES.find(r => r.key === roleKey);
    return found ? found.colorClass : "bg-gray-100 text-gray-700 border-gray-200";
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
                <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Roles</th>
                <th className="text-left px-5 py-3.5 font-semibold text-gray-600 whitespace-nowrap">Actions</th>
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
                    <div className="flex flex-wrap gap-1.5">
                      {(user.roles && user.roles.length > 0 ? user.roles : ["user"]).map((roleKey) => {
                        const roleObj = ALL_ROLES.find(r => r.key === roleKey);
                        return (
                          <span
                            key={roleKey}
                            className={`px-2.5 py-1 text-[11px] font-semibold rounded-full border ${roleObj ? roleObj.colorClass : "bg-gray-100 text-gray-700 border-gray-200"}`}
                          >
                            {roleObj ? roleObj.label : roleKey}
                          </span>
                        );
                      })}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => openEditModal(user)}
                      className="inline-flex items-center gap-1.5 text-brand-600 hover:text-brand-800 text-sm font-medium transition-colors bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-lg"
                    >
                      <Edit2 size={14} />
                      Edit Roles
                    </button>
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

      {/* Edit Role Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-lg font-bold text-gray-800">Edit Roles</h2>
              <button 
                onClick={() => setEditingUser(null)} 
                className="p-2 -mr-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                disabled={savingToggle}
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6 p-3 bg-brand-50 border border-brand-100 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-brand-200 text-brand-700 flex items-center justify-center font-bold text-sm">
                  {editingUser.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 leading-tight">{editingUser.name}</p>
                  <p className="text-xs text-brand-600">{editingUser.email}</p>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">Assign Roles</p>
                <div className="grid grid-cols-2 gap-3">
                  {ALL_ROLES.map(({ key, label }) => {
                    const isChecked = tempRoles.includes(key);
                    const isDisabled = (key === "user" && isChecked) || (editingUser._id === currentAdminId && key === "admin");
                    
                    return (
                      <label 
                        key={key} 
                        className={`flex items-start gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer ${
                          isChecked ? "bg-brand-50 border-brand-500" : "bg-white border-gray-100 hover:border-brand-200"
                        } ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        <div className="flex bg-white items-center justify-center rounded border border-gray-300 w-5 h-5 flex-shrink-0 mt-0.5">
                          {isChecked && (
                            <svg className="w-3.5 h-3.5 text-brand-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={isChecked}
                          onChange={() => handleToggleRole(key)}
                          disabled={isDisabled || savingToggle}
                        />
                        <div>
                          <p className={`text-sm font-semibold ${isChecked ? "text-brand-900" : "text-gray-600"}`}>{label}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex gap-3 p-5 border-t border-gray-100 bg-gray-50">
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="flex-1 py-2.5 px-4 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                disabled={savingToggle}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveRoles}
                className="flex-1 py-2.5 px-4 bg-brand-600 text-white font-medium rounded-xl hover:bg-brand-700 transition-colors flex items-center justify-center gap-2"
                disabled={savingToggle}
              >
                {savingToggle ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default UserManagement;
