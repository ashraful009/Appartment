import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { Building2, Plus, Loader2 } from "lucide-react";
import ManageBuildingsStats from "../../components/admin/buildings/ManageBuildingsStats";
import ManageBuildingsTable from "../../components/admin/buildings/ManageBuildingsTable";

const ManageBuildings = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const { data } = await axios.get("/api/properties", { withCredentials: true });
      setProperties(data.properties || []);
    } catch (error) {
      toast.error("Failed to load properties");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this building permanently?")) return;

    try {
      await axios.delete(`/api/properties/${id}`, { withCredentials: true });
      setProperties((prev) => prev.filter((p) => p._id !== id));
      toast.success("Building deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-end">
        <Link
          to="/admin-panel/buildings"
          className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 shadow-md transition"
        >
          <Plus size={18} />
          Add Building
        </Link>
      </div>

      <ManageBuildingsStats properties={properties} />

      <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
        <ManageBuildingsTable properties={properties} onDelete={handleDelete} />
      </div>
    </div>
  );
};

export default ManageBuildings;