import React from "react";
import { Building2, MapPin } from "lucide-react";

/**
 * PropertyCell — building thumbnail + name + address.
 * Props: property object
 */
const PropertyCell = ({ property }) => (
  <div className="flex items-center gap-3">
    {property?.mainImage ? (
      <img src={property.mainImage} alt={property.name}
        className="w-12 h-12 rounded-xl object-cover flex-shrink-0 border border-gray-200" />
    ) : (
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-brand-800 flex items-center justify-center flex-shrink-0">
        <Building2 size={20} className="text-white/60" />
      </div>
    )}
    <div className="min-w-0">
      <p className="font-semibold text-gray-800 text-sm truncate max-w-[180px]">{property?.name || "—"}</p>
      <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
        <MapPin size={10} className="text-brand-400 flex-shrink-0" />
        <span className="truncate max-w-[160px]">{property?.address || "—"}</span>
      </p>
    </div>
  </div>
);

export default PropertyCell;
