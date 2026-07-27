import React from "react";
import { Link } from "react-router-dom";
import { Building2, Edit, Trash2, Plus, CalendarDays, Grid3X3, Layers, MapPin } from "lucide-react";

const ManageBuildingsTable = ({ properties, onDelete }) => {
  if (properties.length === 0) {
    return (
      <div className="py-20 text-center">
        <Building2 className="mx-auto text-gray-300 w-12 h-12 mb-4" />
        <h3 className="text-lg font-semibold text-gray-800">No Buildings Added</h3>
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
    );
  }

  return (
    <table className="w-full">
      <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
        <tr>
          <th className="px-6 py-4 text-left">Building</th>
          <th className="px-6 py-4 text-left hidden md:table-cell">Specs</th>
          <th className="px-6 py-4 text-left hidden lg:table-cell">Handover</th>
          <th className="px-6 py-4 text-right">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y">
        {properties.map((property) => (
          <tr key={property._id} className="hover:bg-gray-50 transition">
            <td className="px-6 py-4">
              <div className="flex gap-4 items-center">
                <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 border flex items-center justify-center">
                  {property.mainImage ? (
                    <img src={property.mainImage} alt={property.name} className="w-full h-full object-cover" />
                  ) : (
                    <Building2 className="w-6 h-6 text-gray-400" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{property.name}</p>
                  <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                    <MapPin size={13} />
                    {property.address}
                  </p>
                </div>
              </div>
            </td>
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
            <td className="px-6 py-4 hidden lg:table-cell text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <CalendarDays size={14} />
                {property.handoverTime || "TBD"}
              </div>
            </td>
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
                  onClick={() => onDelete(property._id)}
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
  );
};

export default ManageBuildingsTable;
