import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Building2, CalendarClock } from "lucide-react";

// "Mon YYYY" from an ISO date.
const fmtMonthYear = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-GB", { month: "short", year: "numeric" })
    : "—";

const PropertyCard = ({ project, showDate }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
    <div className="h-40 bg-gray-100 flex items-center justify-center">
      {project.coverImage ? (
        <img src={project.coverImage} alt={project.name} className="w-full h-full object-cover" />
      ) : (
        <Building2 size={34} className="text-gray-300" />
      )}
    </div>
    <div className="p-4">
      <div className="flex items-center justify-between gap-2">
        <h4 className="font-bold text-gray-800 truncate">{project.name}</h4>
        <span
          className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
            project.status === "completed"
              ? "bg-emerald-50 text-emerald-700"
              : "bg-blue-50 text-blue-700"
          }`}
        >
          {project.status}
        </span>
      </div>
      {project.description && (
        <p className="text-xs text-gray-500 mt-1.5 line-clamp-2">{project.description}</p>
      )}
      {showDate && (
        <div className="flex items-center gap-1.5 mt-3 text-xs font-semibold text-gray-600">
          <CalendarClock size={13} className="text-brand-500" />
          Expected: {fmtMonthYear(project.expectedCompleteDate)}
        </div>
      )}
    </div>
  </div>
);

const InvestorProperties = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("running");

  useEffect(() => {
    axios
      .get("/api/projects", { withCredentials: true })
      .then(({ data }) => setProjects(data))
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  }, []);

  const list = useMemo(() => {
    const filtered = projects.filter((p) => p.status === tab);
    if (tab === "running") {
      // Soonest expected-complete first; undated ones go last.
      return [...filtered].sort((a, b) => {
        const da = a.expectedCompleteDate ? new Date(a.expectedCompleteDate).getTime() : Infinity;
        const db = b.expectedCompleteDate ? new Date(b.expectedCompleteDate).getTime() : Infinity;
        return da - db;
      });
    }
    return filtered;
  }, [projects, tab]);

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">Properties</h1>
        <p className="text-gray-500 text-sm mt-1">Browse running & completed projects.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {["running", "completed"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold capitalize transition-colors ${
              tab === t
                ? "bg-brand-600 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-56 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center text-gray-400">
          No {tab} properties yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map((p) => (
            <PropertyCard key={p._id} project={p} showDate={tab === "running"} />
          ))}
        </div>
      )}
    </div>
  );
};

export default InvestorProperties;
