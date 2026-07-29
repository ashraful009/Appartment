import React, { useEffect, useState } from "react";
import axios from "axios";
import { X, ChevronDown, ChevronRight, User, Users, TrendingUp, AlertCircle } from "lucide-react";

const TreeNodeView = ({ node, depth = 0 }) => {
  const [expanded, setExpanded] = useState(depth < 2); // default expand top 2 levels

  const hasChildren = node.children && node.children.length > 0;
  const mainRole = (node.roles && node.roles.length > 0 ? node.roles : ["user"])[0];

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "Director": return "bg-purple-100 text-purple-800 border-purple-200";
      case "GM": return "bg-blue-100 text-blue-800 border-blue-200";
      case "AGM": return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "area_manager": return "bg-orange-100 text-orange-800 border-orange-200";
      case "seller": return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "customer": return "bg-amber-100 text-amber-800 border-amber-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="select-none">
      <div 
        onClick={() => hasChildren && setExpanded(!expanded)}
        className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
          hasChildren ? "cursor-pointer hover:border-brand-300 hover:bg-brand-50/30" : "bg-white border-gray-100"
        } ${depth === 0 ? "bg-brand-50/50 border-brand-200 shadow-sm" : "bg-white border-gray-200/80 mt-2"}`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center justify-center w-6 h-6 text-gray-400">
            {hasChildren ? (
              expanded ? <ChevronDown size={18} className="text-brand-600" /> : <ChevronRight size={18} />
            ) : (
              <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
            )}
          </div>

          {node.avatar ? (
            <img src={node.avatar} alt={node.name} className="w-9 h-9 rounded-full object-cover border border-gray-200 flex-shrink-0" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center text-sm flex-shrink-0">
              {node.name?.[0]?.toUpperCase() || "?"}
            </div>
          )}

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-bold text-gray-900 truncate text-sm">{node.name}</p>
              <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-md border ${getRoleBadgeColor(mainRole)}`}>
                {mainRole}
              </span>
            </div>
            <p className="text-xs text-gray-500 truncate mt-0.5">{node.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0 text-xs ml-4">
          {hasChildren && (
            <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700 font-semibold">
              <Users size={12} />
              <span>{node.children.length} Subordinate{node.children.length > 1 ? "s" : ""}</span>
            </div>
          )}

          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-lg">
            <span className="font-semibold text-gray-700">Leads: {node.leadStats?.totalLeads ?? 0}</span>
            <span className="text-gray-400">|</span>
            <span className="text-amber-600 font-semibold">{node.leadStats?.onProcessLeads ?? 0} Active</span>
            <span className="text-gray-400">|</span>
            <span className="text-rose-600 font-semibold">{node.leadStats?.cancelledLeads ?? 0} Lost</span>
          </div>
        </div>
      </div>

      {hasChildren && expanded && (
        <div className="ml-6 pl-4 border-l-2 border-brand-200/60 space-y-2 mt-1 py-1">
          {node.children.map(child => (
            <TreeNodeView key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

const DrillDownModal = ({ rootUserId = "", onClose }) => {
  const [treeData, setTreeData] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");

  useEffect(() => {
    const fetchTree = async () => {
      setLoading(true);
      try {
        const url = rootUserId ? `/api/hierarchy/tree?userId=${rootUserId}` : `/api/hierarchy/tree`;
        const res = await axios.get(url, { withCredentials: true });
        setTreeData(res.data.tree);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load drill-down tree hierarchy.");
      } finally {
        setLoading(false);
      }
    };
    fetchTree();
  }, [rootUserId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50/80">
          <div>
            <h2 className="text-xl font-extrabold text-gray-900">Interactive Tree Drill-down</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Click on any manager node to expand or collapse their immediate subordinates.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        
        <div className="p-6 overflow-y-auto flex-1 bg-gray-50/30">
          {loading ? (
            <div className="space-y-4 py-8">
              <div className="h-14 bg-gray-200 rounded-xl animate-pulse" />
              <div className="ml-6 space-y-3">
                <div className="h-12 bg-gray-100 rounded-xl animate-pulse w-5/6" />
                <div className="h-12 bg-gray-100 rounded-xl animate-pulse w-4/6" />
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm text-center">
              {error}
            </div>
          ) : treeData ? (
            <div className="space-y-4">
              <TreeNodeView node={treeData} depth={0} />
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">No hierarchy tree found.</div>
          )}
        </div>

        
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-semibold text-sm rounded-xl transition-all"
          >
            Close View
          </button>
        </div>

      </div>
    </div>
  );
};

export { TreeNodeView };
export default DrillDownModal;
