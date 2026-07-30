import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Plus, Trash2, Pencil, X, Building2 } from "lucide-react";

const emptyForm = { name: "", description: "", status: "running", expectedCompleteDate: "", file: null };


const toMonthValue = (d) => {
  if (!d) return "";
  const date = new Date(d);
  if (isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
};

const ProjectModal = ({ open, onClose, onSave, editing, loading }) => {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (open) {
      setForm(
        editing
          ? {
              name: editing.name,
              description: editing.description,
              status: editing.status,
              expectedCompleteDate: toMonthValue(editing.expectedCompleteDate),
              file: null,
            }
          : emptyForm
      );
    }
  }, [open, editing]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h3 className="font-extrabold text-gray-900 text-lg">
            {editing ? "Edit Project" : "New Project"}
          </h3>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg">
            <X size={18} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            >
              <option value="running">Running</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Expected Complete Date <span className="text-gray-400 font-normal">(month &amp; year)</span>
            </label>
            <input
              type="month"
              value={form.expectedCompleteDate}
              onChange={(e) => setForm({ ...form, expectedCompleteDate: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Cover Image {editing && <span className="text-gray-400 font-normal">(optional)</span>}
            </label>
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              onChange={(e) => setForm({ ...form, file: e.target.files[0] })}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 cursor-pointer border border-gray-200 rounded-xl bg-gray-50"
            />
          </div>
        </div>
        <div className="p-6 pt-2 border-t border-gray-100 flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(form)}
            disabled={loading || !form.name.trim()}
            className="flex-1 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-bold hover:bg-brand-700 disabled:opacity-50"
          >
            {loading ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

const ProjectsManagement = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/admin/projects", { withCredentials: true });
      setProjects(data);
    } catch {
      toast.error("Failed to load projects.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const save = async (form) => {
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("description", form.description);
      fd.append("status", form.status);
      fd.append("expectedCompleteDate", form.expectedCompleteDate || "");
      if (form.file) fd.append("mainImage", form.file);

      if (editing) {
        await axios.put(`/api/admin/projects/${editing._id}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        });
        toast.success("Project updated.");
      } else {
        await axios.post("/api/admin/projects", fd, {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        });
        toast.success("Project created.");
      }
      setModalOpen(false);
      setEditing(null);
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save project.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this project?")) return;
    try {
      await axios.delete(`/api/admin/projects/${id}`, { withCredentials: true });
      toast.success("Project deleted.");
      load();
    } catch {
      toast.error("Failed to delete project.");
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-end">
        <button
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700"
        >
          <Plus size={16} /> New Project
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center text-gray-400">
          No projects yet. Create your first one.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p) => (
            <div
              key={p._id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
            >
              <div className="h-32 bg-gray-100 flex items-center justify-center">
                {p.coverImage ? (
                  <img src={p.coverImage} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  <Building2 size={30} className="text-gray-300" />
                )}
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-bold text-gray-800 truncate">{p.name}</h4>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                      p.status === "completed"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-blue-50 text-blue-700"
                    }`}
                  >
                    {p.status}
                  </span>
                </div>
                {p.description && (
                  <p className="text-xs text-gray-500 mt-1.5 line-clamp-2">{p.description}</p>
                )}
                {p.expectedCompleteDate && (
                  <p className="text-[11px] font-semibold text-gray-500 mt-2">
                    Expected:{" "}
                    {new Date(p.expectedCompleteDate).toLocaleDateString("en-GB", {
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                )}
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => {
                      setEditing(p);
                      setModalOpen(true);
                    }}
                    className="flex-1 inline-flex items-center justify-center gap-1 py-1.5 bg-gray-50 border border-gray-200 text-gray-600 text-xs font-bold rounded-lg hover:bg-gray-100"
                  >
                    <Pencil size={13} /> Edit
                  </button>
                  <button
                    onClick={() => remove(p._id)}
                    className="inline-flex items-center justify-center gap-1 py-1.5 px-3 bg-red-50 text-red-600 text-xs font-bold rounded-lg hover:bg-red-100"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ProjectModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        onSave={save}
        editing={editing}
        loading={saving}
      />
    </div>
  );
};

export default ProjectsManagement;
