import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Building2, Plus, Loader2 } from "lucide-react";
import HorizontalPropertyCard from "../../components/common/HorizontalPropertyCard";

const AdminBookUnit = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const { data } = await axios.get("/api/admin/properties", { withCredentials: true });
        setProperties(data.properties || []);
      } catch (error) {
        console.error("Failed to load properties:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-6 lg:p-10 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
            <Building2 className="text-indigo-600" />
            Select a Property to Book Units
          </h1>
          <p className="text-gray-500 text-sm mt-2">
            Select a property listing below to view real-time unit availability and manage bookings.
          </p>
        </div>
        <button
          onClick={() => navigate("/admin-panel/buildings")}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 text-sm transition-colors shadow-sm"
        >
          <Plus size={16} /> Add Building
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-20 text-gray-400">
          <Loader2 size={32} className="animate-spin" />
        </div>
      ) : properties.length === 0 ? (
        <div className="bg-gray-50 border border-dashed border-gray-200 rounded-3xl p-16 text-center">
          <Building2 size={48} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">No properties listed yet</h2>
          <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">
            Get started by adding your first building. You can then manage its units and securely book them for customers.
          </p>
          <button
            onClick={() => navigate("/admin-panel/buildings")}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-sm inline-flex items-center gap-2"
          >
            <Plus size={16} /> Add First Building
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {properties.map((p) => (
            <HorizontalPropertyCard
              key={p._id}
              property={p}
              onClick={() => navigate(`/admin-panel/book-unit/${p._id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminBookUnit;
