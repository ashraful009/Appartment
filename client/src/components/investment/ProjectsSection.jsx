import React, { useEffect, useState } from "react";
import axios from "axios";
import { Building2 } from "lucide-react";

const ProjectCard = ({ project }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
    <div className="h-32 bg-gray-100 flex items-center justify-center">
      {project.coverImage ? (
        <img
          src={project.coverImage}
          alt={project.name}
          className="w-full h-full object-cover"
        />
      ) : (
        <Building2 size={32} className="text-gray-300" />
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
    </div>
  </div>
);


const ProjectsSection = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("/api/projects", { withCredentials: true })
      .then(({ data }) => setProjects(data))
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  }, []);

  const running = projects.filter((p) => p.status === "running");
  const completed = projects.filter((p) => p.status === "completed");

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-44 bg-gray-100 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  const Group = ({ title, list }) =>
    list.length === 0 ? null : (
      <div>
        <h3 className="text-sm font-bold text-gray-700 mb-3">{title}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map((p) => (
            <ProjectCard key={p._id} project={p} />
          ))}
        </div>
      </div>
    );

  if (projects.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center text-gray-400 text-sm">
        No projects to show yet.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Group title="Running Projects" list={running} />
      <Group title="Completed Projects" list={completed} />
    </div>
  );
};

export default ProjectsSection;
