import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  MapPin, Plus, Trash2, CheckCircle, AlertCircle, X, Loader2,
} from "lucide-react";

const Toast = ({ type, msg, onClose }) => (
  <div
    className={`fixed bottom-6 right-6 z-50 flex items-start gap-3 px-5 py-4 rounded-xl shadow-lg text-sm font-medium max-w-sm ${
      type === "success"
        ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
        : "bg-red-50 border border-red-200 text-red-700"
    }`}
  >
    {type === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
    <span className="flex-1">{msg}</span>
    <button onClick={onClose}><X size={14} /></button>
  </div>
);

const AreaManagement = () => {
  const [areas, setAreas] = useState([]);
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchAreas = async () => {
    try {
      const { data } = await axios.get("/api/areas");
      setAreas(data.areas || []);
    } catch (err) {
      console.error("Failed to fetch areas:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAreas();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!country.trim() || !city.trim() || !name.trim()) {
      showToast("error", "Please enter country, city, and area name.");
      return;
    }
    setSubmitting(true);
    try {
      await axios.post("/api/areas", { 
        country: country.trim(), 
        city: city.trim(), 
        name: name.trim() 
      }, { withCredentials: true });
      
      showToast("success", `"${name.trim()}" added successfully.`);
      setName("");
      // intentionally keeping country and city so user can add multiple areas to the same city easily
      fetchAreas();
    } catch (err) {
      showToast("error", err?.response?.data?.message || "Failed to add area.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, areaName) => {
    if (!window.confirm(`Delete "${areaName}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      await axios.delete(`/api/areas/${id}`, { withCredentials: true });
      showToast("success", `"${areaName}" deleted.`);
      fetchAreas();
    } catch (err) {
      showToast("error", err?.response?.data?.message || "Failed to delete area.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-8 space-y-8">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <MapPin className="text-indigo-600" />
          Manage Areas
        </h1>
        <p className="text-gray-500 text-sm mt-2">
          Add or remove geographic areas. These populate the "Area" dropdown in the Add Building form and the homepage filter.
        </p>
      </div>

      {/* Add Area Form */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-5">
          Add New Area
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm font-semibold text-gray-600 mb-1.5 block">
                Country <span className="text-red-400">*</span>
              </label>
              <input
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="e.g. Bangladesh"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition-all"
              />
            </div>
            <div className="flex-1">
              <label className="text-sm font-semibold text-gray-600 mb-1.5 block">
                City <span className="text-red-400">*</span>
              </label>
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Dhaka"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition-all"
              />
            </div>
            <div className="flex-1">
              <label className="text-sm font-semibold text-gray-600 mb-1.5 block">
                Area Name <span className="text-red-400">*</span>
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Gulshan"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition-all"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 disabled:opacity-60 transition-colors whitespace-nowrap"
          >
            {submitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Plus size={16} /> Add Area
              </>
            )}
          </button>
        </form>
      </div>

      {/* Area List */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-5">
          Existing Areas ({areas.length})
        </h2>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
          </div>
        ) : areas.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <MapPin size={28} className="text-gray-300" />
            </div>
            <p className="text-gray-500 text-sm font-medium">No areas added yet.</p>
            <p className="text-gray-400 text-xs mt-1">Use the form above to add your first area.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {areas.map((area, i) => (
              <div
                key={area._id}
                className="flex items-center justify-between py-3 px-2 group hover:bg-gray-50 rounded-lg transition-colors -mx-2"
              >
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-sm font-medium text-gray-800">
                    {area.country} &gt; {area.city} &gt; {area.name}
                  </span>
                </div>
                <button
                  onClick={() => handleDelete(area._id, area.name)}
                  disabled={deletingId === area._id}
                  className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-red-600 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50"
                >
                  {deletingId === area._id ? (
                    <span className="w-3.5 h-3.5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Trash2 size={13} />
                  )}
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AreaManagement;
