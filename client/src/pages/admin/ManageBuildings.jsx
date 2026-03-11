import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Building2,
  Edit,
  Trash2,
  Plus,
  Loader2,
  CalendarDays,
  Grid3X3,
  Layers,
  MapPin,
} from "lucide-react";

const ManageBuildings = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const { data } = await axios.get("/api/properties");
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
    <div className="p-8 max-w-7xl mx-auto space-y-8">

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Building2 className="w-8 h-8 text-indigo-600" />
            Building Management
          </h1>
          <p className="text-gray-500 text-sm mt-2">
            Manage all buildings and property listings from the admin dashboard.
          </p>
        </div>

        <Link
          to="/admin-panel/buildings"
          className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 shadow-md transition"
        >
          <Plus size={18} />
          Add Building
        </Link>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <p className="text-sm text-gray-500">Total Buildings</p>
          <h2 className="text-3xl font-bold text-gray-900 mt-1">
            {properties.length}
          </h2>
        </div>

        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <p className="text-sm text-gray-500">Total Floors</p>
          <h2 className="text-3xl font-bold text-gray-900 mt-1">
            {properties.reduce((sum, p) => sum + (p.floors || 0), 0)}
          </h2>
        </div>

        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <p className="text-sm text-gray-500">Upcoming Handover</p>
          <h2 className="text-3xl font-bold text-gray-900 mt-1">
            {
              properties.filter((p) => p.handoverTime && p.handoverTime !== "Completed").length
            }
          </h2>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">

        {properties.length === 0 ? (
          <div className="py-20 text-center">
            <Building2 className="mx-auto text-gray-300 w-12 h-12 mb-4" />
            <h3 className="text-lg font-semibold text-gray-800">
              No Buildings Added
            </h3>
            <p className="text-gray-500 text-sm mt-2 mb-6">
              Add your first building to start managing properties.
            </p>

            <Link
              to="/admin-panel/buildings"
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2 rounded-lg"
            >
              <Plus size={16} />
              Add Building
            </Link>
          </div>
        ) : (
          <table className="w-full">

            {/* Table Header */}
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
              <tr>
                <th className="px-6 py-4 text-left">Building</th>
                <th className="px-6 py-4 text-left hidden md:table-cell">Specs</th>
                <th className="px-6 py-4 text-left hidden lg:table-cell">Handover</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y">

              {properties.map((property) => (
                <tr key={property._id} className="hover:bg-gray-50 transition">

                  {/* Building Info */}
                  <td className="px-6 py-4">
                    <div className="flex gap-4 items-center">

                      <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 border flex items-center justify-center">
                        {property.mainImage ? (
                          <img
                            src={property.mainImage}
                            alt={property.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Building2 className="w-6 h-6 text-gray-400" />
                        )}
                      </div>

                      <div>
                        <p className="font-semibold text-gray-900">
                          {property.name}
                        </p>

                        <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                          <MapPin size={13} />
                          {property.address}
                        </p>
                      </div>

                    </div>
                  </td>

                  {/* Specs */}
                  <td className="px-6 py-4 hidden md:table-cell">
                    <div className="space-y-1 text-sm text-gray-600">

                      <div className="flex items-center gap-2">
                        <Grid3X3 size={14} />
                        {property.landSize || "—"}
                      </div>

                      <div className="flex items-center gap-2">
                        <Layers size={14} />
                        {property.floors ? `${property.floors} Floors` : "—"}
                      </div>

                    </div>
                  </td>

                  {/* Handover */}
                  <td className="px-6 py-4 hidden lg:table-cell text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <CalendarDays size={14} />
                      {property.handoverTime || "TBD"}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">

                      <Link
                        to={`/admin-panel/edit-building/${property._id}`}
                        className="px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 flex items-center gap-1"
                      >
                        <Edit size={14} />
                        Edit
                      </Link>

                      <button
                        onClick={() => handleDelete(property._id)}
                        className="px-3 py-1.5 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 flex items-center gap-1"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>

                    </div>
                  </td>

                </tr>
              ))}

            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ManageBuildings;