import React, { useEffect, useState } from "react";
import axios from "axios";
import { Users, AlertTriangle, ShieldCheck, Briefcase, RefreshCw, UserCheck } from "lucide-react";
import { TreeNodeView } from "../../components/hierarchy/DrillDownModal";

const SystemHierarchyView = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ mainTrees: [], unassignedUsers: [], otherRoles: {} });
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("trees"); // "trees", "unassigned", "other"

  const fetchHierarchy = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get("/api/hierarchy/full-system");
      setData(res.data);
    } catch (err) {
      console.error("Failed to fetch full system hierarchy:", err);
      setError("Failed to load organizational hierarchy. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHierarchy();
  }, []);

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-64 bg-gray-200 rounded-lg animate-pulse" />
          <div className="h-10 w-32 bg-gray-200 rounded-xl animate-pulse" />
        </div>
        <div className="h-96 bg-gray-100 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center max-w-lg mx-auto mt-12">
          <AlertTriangle className="mx-auto text-red-500 mb-3" size={32} />
          <h3 className="text-lg font-bold text-red-900 mb-1">Error Loading Hierarchy</h3>
          <p className="text-sm text-red-700 mb-4">{error}</p>
          <button
            onClick={fetchHierarchy}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold text-sm rounded-xl transition-all inline-flex items-center gap-2"
          >
            <RefreshCw size={16} /> Retry
          </button>
        </div>
      </div>
    );
  }

  const { mainTrees = [], unassignedUsers = [], otherRoles = {} } = data;
  const otherRolesKeys = Object.keys(otherRoles);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white p-6 rounded-2xl shadow-xl border border-gray-800">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <span className="p-1.5 bg-brand-500/20 text-brand-400 rounded-lg border border-brand-500/30">
              <Users size={20} />
            </span>
            <h1 className="text-2xl font-extrabold tracking-tight">Full-System Organizational Hierarchy</h1>
          </div>
          <p className="text-gray-400 text-sm">
            Comprehensive multi-root view of all Directors, reporting chains, unassigned staff, and departmental roles.
          </p>
        </div>
        <button
          onClick={fetchHierarchy}
          className="inline-flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 text-sm font-semibold px-4 py-2.5 rounded-xl transition-all shadow-sm shrink-0 active:scale-95"
        >
          <RefreshCw size={15} />
          <span>Refresh View</span>
        </button>
      </div>

      {/* Tabs / Overview Bar */}
      <div className="flex flex-wrap gap-3 border-b border-gray-200 pb-4">
        <button
          onClick={() => setActiveTab("trees")}
          className={`flex items-center gap-2.5 px-5 py-3 rounded-xl font-bold text-sm transition-all shadow-sm ${
            activeTab === "trees"
              ? "bg-brand-600 text-white shadow-brand-500/20"
              : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
          }`}
        >
          <Briefcase size={16} />
          <span>Main Chain Trees ({mainTrees.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("unassigned")}
          className={`flex items-center gap-2.5 px-5 py-3 rounded-xl font-bold text-sm transition-all shadow-sm ${
            activeTab === "unassigned"
              ? "bg-amber-600 text-white shadow-amber-500/20"
              : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
          }`}
        >
          <AlertTriangle size={16} className={unassignedUsers.length > 0 ? "text-amber-300 animate-pulse" : ""} />
          <span>Unassigned Users ({unassignedUsers.length})</span>
          {unassignedUsers.length > 0 && (
            <span className="bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full font-extrabold ml-1">
              Action Required
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("other")}
          className={`flex items-center gap-2.5 px-5 py-3 rounded-xl font-bold text-sm transition-all shadow-sm ${
            activeTab === "other"
              ? "bg-indigo-600 text-white shadow-indigo-500/20"
              : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
          }`}
        >
          <ShieldCheck size={16} />
          <span>Other Roles & Teams ({otherRolesKeys.length})</span>
        </button>
      </div>

      {/* Tab Content: Main Chain Trees */}
      {activeTab === "trees" && (
        <div className="space-y-6">
          <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex items-center justify-between text-sm text-blue-900">
            <span>
              💡 Each tree below represents a <strong>Director</strong> and their complete subordinate hierarchy (GM → AGM → Area Manager → Seller → Customer).
            </span>
          </div>

          {mainTrees.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-gray-500">
              <UserCheck size={36} className="mx-auto text-gray-300 mb-3" />
              <p className="font-semibold text-gray-700">No Director Trees Found</p>
              <p className="text-sm text-gray-400 mt-1">Assign the 'Director' role to a user in User Management to initiate a hierarchy tree.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {mainTrees.map((rootNode) => (
                <div key={rootNode._id} className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden p-6">
                  <div className="border-b border-gray-100 pb-4 mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-100 border border-purple-200 flex items-center justify-center font-extrabold text-purple-700">
                        {rootNode.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{rootNode.name}</h3>
                        <p className="text-xs text-gray-500">{rootNode.email} • Director Root</p>
                      </div>
                    </div>
                    <span className="bg-purple-50 text-purple-700 text-xs font-bold px-3 py-1 rounded-full border border-purple-200">
                      Total Subordinates: {Object.values(rootNode.roleCounts || {}).reduce((a, b) => a + b, 0)}
                    </span>
                  </div>
                  <div className="pl-2 overflow-x-auto">
                    <TreeNodeView node={rootNode} depth={0} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Unassigned Users */}
      {activeTab === "unassigned" && (
        <div className="space-y-6">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-900 flex items-start gap-3">
            <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={18} />
            <div>
              <p className="font-bold">Unassigned Main-Chain Users</p>
              <p className="text-amber-800 text-xs mt-0.5">
                These users hold a hierarchy role (GM, AGM, Area Manager, Seller, or Customer) but currently have no superior assigned. They do not appear in the main trees above. Please go to <strong>User Management</strong> and assign them under a valid superior.
              </p>
            </div>
          </div>

          {unassignedUsers.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-gray-500">
              <UserCheck size={36} className="mx-auto text-emerald-500 mb-3" />
              <p className="font-bold text-gray-900 text-lg">All Clean! No Unassigned Users</p>
              <p className="text-sm text-gray-400 mt-1">Every main-chain user is properly connected to a hierarchy tree.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {unassignedUsers.map((u) => (
                <div key={u._id} className="bg-white rounded-xl border border-amber-200 shadow-sm p-5 flex flex-col justify-between hover:shadow-md transition-all">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center">
                        {u.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-wrap gap-1 justify-end">
                        {(u.roles || []).map((r) => (
                          <span key={r} className="bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-bold px-2 py-0.5 rounded-md">
                            {r}
                          </span>
                        ))}
                      </div>
                    </div>
                    <h4 className="font-bold text-gray-900 text-base">{u.name}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">{u.email}</p>
                    {u.phone && <p className="text-xs text-gray-400 mt-0.5">{u.phone}</p>}
                  </div>
                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-[11px] text-red-600 font-semibold flex items-center gap-1">
                      <AlertTriangle size={12} /> Missing Superior
                    </span>
                    <a
                      href="/admin-panel/users"
                      className="text-xs font-bold text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-lg transition-all"
                    >
                      Assign Superior →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Other Roles */}
      {activeTab === "other" && (
        <div className="space-y-8">
          <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 text-sm text-indigo-900">
            <span>
              💡 Flat directory of users holding departmental, operational, or investor roles outside the sales hierarchy chain.
            </span>
          </div>

          {otherRolesKeys.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-gray-500">
              <Users size={36} className="mx-auto text-gray-300 mb-3" />
              <p className="font-semibold text-gray-700">No Other Role Users Found</p>
            </div>
          ) : (
            otherRolesKeys.map((roleKey) => {
              const usersList = otherRoles[roleKey] || [];
              return (
                <div key={roleKey} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-gray-900 text-lg capitalize">{roleKey} Team</h3>
                      <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
                        {usersList.length} Users
                      </span>
                    </div>
                  </div>
                  <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {usersList.map((u) => (
                      <div key={u._id} className="border border-gray-200/80 rounded-xl p-4 hover:border-gray-300 transition-all bg-gray-50/30">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-800 font-bold flex items-center justify-center shrink-0">
                            {u.name?.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-bold text-gray-900 text-sm truncate">{u.name}</h4>
                            <p className="text-xs text-gray-500 truncate">{u.email}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default SystemHierarchyView;
