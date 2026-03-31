import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { Building2, ArrowLeft, Loader2 } from "lucide-react";
import PropertyVisualizer from "../../components/common/PropertyVisualizer";

const BookUnitDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [property, setProperty] = useState(null);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);

  // Determine viewer role based on React Router path prefix
  // If located in admin panel -> 'admin', if seller -> 'seller'
  const isSeller = window.location.pathname.includes('/seller-panel');
  const viewerRole = isSeller ? 'seller' : 'admin';
  const backPath = isSeller ? '/seller-panel/book-unit' : '/admin-panel/book-unit';

  useEffect(() => {
    const fetchPropertyAndUnits = async () => {
      try {
        const [propRes, unitsRes] = await Promise.all([
          axios.get(`/api/properties/${id}`), 
          axios.get(`/api/properties/${id}/units`, { withCredentials: true })
        ]);
        setProperty(propRes.data.property);
        setUnits(unitsRes.data.units || []);
      } catch (error) {
        console.error("Failed to load details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPropertyAndUnits();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20 text-brand-500 min-h-[60vh]">
        <Loader2 size={36} className="animate-spin" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="max-w-7xl mx-auto p-6 lg:p-10 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Property Not Found</h2>
        <button onClick={() => navigate(backPath)} className="text-brand-600 font-semibold">
          Return to List
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 lg:p-10 space-y-8">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate(backPath)}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors font-medium text-sm mb-4"
        >
          <ArrowLeft size={16} /> Back to Properties
        </button>
        <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
          <Building2 className="text-brand-600" />
          {property.name} Unit Map
        </h1>
        <p className="text-gray-500 text-sm mt-2">
          Click on any available unit down below to initiate a booking or sale process.
        </p>
      </div>

      <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 lg:p-8">
         <PropertyVisualizer 
           totalUnits={property.totalUnits} 
           totalFloors={property.floors} 
           units={units}
           viewerRole={viewerRole}
         />
      </div>
    </div>
  );
};

export default BookUnitDetail;
