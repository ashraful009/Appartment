import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Building2, Loader2, ArrowRight } from "lucide-react";
import HorizontalPropertyCard from "../../components/common/HorizontalPropertyCard";

const SellerBookUnit = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const { data } = await axios.get("/api/properties/public", {
          params: { limit: 100 } // Get all for booking portal
        });
        setProperties(data.properties || []);
      } catch (error) {
        console.error("Failed to load seller properties:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-6 lg:p-10 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
          <Building2 className="text-brand-600" />
          Select a Property to Book Units
        </h1>
        <p className="text-gray-500 text-sm mt-2 max-w-2xl">
          Search properties, view real-time availability, and securely reserve units for your customers right from your dashboard.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-20 text-gray-400">
          <Loader2 size={32} className="animate-spin" />
        </div>
      ) : properties.length === 0 ? (
        <div className="bg-gray-50 border border-dashed border-gray-200 rounded-3xl p-16 text-center">
          <Building2 size={48} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">No active properties available</h2>
          <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">
            There are currently no listed properties. Check back later or contact your administrator.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {properties.map((p) => (
            <HorizontalPropertyCard
              key={p._id}
              property={p}
              onClick={() => navigate(`/seller-panel/book-unit/${p._id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SellerBookUnit;
