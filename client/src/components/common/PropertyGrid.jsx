import React from "react";
import PropertyCard from "./PropertyCard";
import { Building2 } from "lucide-react";

const PropertyGrid = ({ properties, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5 lg:gap-8 w-full">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="w-full h-[220px] sm:h-[320px] lg:h-[500px] rounded-2xl lg:rounded-3xl bg-gray-200 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!properties || properties.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-24 text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mb-5">
          <Building2 size={36} className="text-gray-300" />
        </div>
        <h3 className="text-xl font-bold text-gray-700 mb-2">No Properties Yet</h3>
        <p className="text-gray-400 text-sm max-w-xs">
          No properties have been listed. Check back soon or contact us for off-market listings.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-gray-500 font-medium">
          Showing <span className="font-bold text-gray-800">{properties.length}</span> {properties.length === 1 ? "property" : "properties"}
        </p>
      </div>

      {/* 2-col on mobile → 2-col on md → 3-col on lg */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5 lg:gap-8 w-full">
        {properties.map((property, i) => (
          <PropertyCard key={property._id} property={property} index={i} />
        ))}
      </div>
    </div>
  );
};

export default PropertyGrid;
