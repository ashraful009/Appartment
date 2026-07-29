import React, { useState, useEffect } from "react";
import axios from "axios";
import { X, User, Phone, Loader2, CheckCircle } from "lucide-react";

const ManualAddLeadModal = ({ isOpen, onClose, onSuccess }) => {
  const [form, setForm] = useState({ name: "", phone: "", propertyId: "" });
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setForm({ name: "", phone: "", propertyId: "" });
      setError("");
      setSuccess(false);
      fetchProperties();
    }
  }, [isOpen]);

  const fetchProperties = async () => {
    try {
      const { data } = await axios.get("/api/catalog/properties?limit=100");
      setProperties(data.properties || data);
    } catch (err) {
      console.error("Failed to fetch properties", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone) {
      setError("Name and phone are required.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await axios.post("/api/requests/manual", form, { withCredentials: true });
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add lead.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">Add Lead</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {success ? (
            <div className="text-center py-6">
              <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900">Lead Added!</h3>
              <p className="text-sm text-gray-500 mt-1">Lead has been directly assigned to you.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 text-red-700 text-sm rounded-xl border border-red-200">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name <span className="text-red-500">*</span></label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={e => setForm({...form, name: e.target.value})}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                    placeholder="Lead Name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={e => setForm({...form, phone: e.target.value})}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                    placeholder="01XXXXXXXXX"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Interested Property (Optional)</label>
                <select
                  value={form.propertyId}
                  onChange={e => setForm({...form, propertyId: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white"
                >
                  <option value="">-- Select a property --</option>
                  {Array.isArray(properties) && properties.map(p => (
                    <option key={p.id || p._id} value={p.id || p._id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-2.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : null}
                  {loading ? "Adding..." : "Add Lead"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManualAddLeadModal;
