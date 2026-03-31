import React from 'react';
import PropertyVisualizer from "../common/PropertyVisualizer";

const PropertyUnitsTab = ({ property, units }) => {
  if (!property || !property.totalUnits || !property.floors) {
    return (
      <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 lg:p-8 text-center text-gray-500">
        Unit map is not available for this property yet.
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 lg:p-8">
      <div className="mb-6 pb-4 border-b border-gray-100">
        <h3 className="text-xl font-extrabold text-gray-900 mb-1">Apartment Availabilities</h3>
        <p className="text-sm text-gray-500">Live view of exactly which units are available on each floor.</p>
      </div>

      <PropertyVisualizer 
        totalUnits={property.totalUnits} 
        totalFloors={property.floors} 
        units={units} 
      />
    </div>
  );
};

export default PropertyUnitsTab;
