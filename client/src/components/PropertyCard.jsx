import React from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Building2 } from "lucide-react";

const COLORS = [
  "from-brand-600 to-brand-800",
  "from-emerald-500 to-teal-700",
  "from-amber-500 to-orange-700",
  "from-rose-500 to-pink-700",
  "from-indigo-500 to-purple-700",
];

const PropertyCard = ({ property, index = 0 }) => {
  const navigate = useNavigate();
  const color    = COLORS[index % COLORS.length];

  return (
    <div
      onClick={() => navigate(`/property/${property._id}`)}
      className="group relative w-[400px] h-[560px] flex-shrink-0 rounded-3xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-shadow duration-500"
    >
      {/* ── Full-card image with "fill-up" zoom ── */}
      {property.mainImage ? (
        <img
          src={property.mainImage}
          alt={property.name}
          className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-125"
        />
      ) : (
        <div
          className={`w-full h-full bg-gradient-to-br ${color} flex items-center justify-center transition-transform duration-700 ease-in-out group-hover:scale-125`}
        >
          <Building2 size={72} className="text-white/30" />
        </div>
      )}

      {/* ── Persistent bottom gradient for text readability ── */}
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/85 via-black/40 to-transparent z-10 pointer-events-none" />

      {/* ── Text overlay — sits above image and gradient ── */}
      <div className="absolute inset-x-0 bottom-0 z-20 p-6 flex flex-col gap-2">
        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-1">
          {property.floors > 0 && (
            <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full border border-white/20">
              {property.floors} floors
            </span>
          )}
          {property.totalUnits > 0 && (
            <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full border border-white/20">
              {property.totalUnits} units
            </span>
          )}
          {property.handoverTime && (
            <span className="bg-yellow-400/80 backdrop-blur-sm text-yellow-900 text-xs font-bold px-2.5 py-1 rounded-full">
              📅 {property.handoverTime}
            </span>
          )}
        </div>

        {/* Building name */}
        <h3 className="text-xl font-extrabold text-white leading-tight drop-shadow-md line-clamp-2">
          {property.name}
        </h3>

        {/* Location */}
        <div className="flex items-start gap-1.5 text-white/80">
          <MapPin size={14} className="flex-shrink-0 mt-0.5 text-yellow-300" />
          <p className="text-sm line-clamp-1">{property.address}</p>
        </div>

        {/* Apartment sizes */}
        {property.apartmentSizes?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-1">
            {property.apartmentSizes.slice(0, 3).map((s, i) => (
              <span key={i} className="bg-white/15 backdrop-blur-sm text-white text-xs font-medium px-2 py-0.5 rounded-lg border border-white/20">
                {s.type}: {s.size}
              </span>
            ))}
            {property.apartmentSizes.length > 3 && (
              <span className="text-white/60 text-xs self-center">+{property.apartmentSizes.length - 3}</span>
            )}
          </div>
        )}

        {/* View Details button — slides up from bottom on hover */}
        <button
          onClick={(e) => { e.stopPropagation(); navigate(`/property/${property._id}`); }}
          className="mt-3 w-full py-2.5 rounded-xl bg-white text-gray-900 text-sm font-bold
                     opacity-0 translate-y-4
                     group-hover:opacity-100 group-hover:translate-y-0
                     transition-all duration-500 ease-in-out
                     hover:bg-brand-50 shadow-lg"
        >
          View Details →
        </button>
      </div>
    </div>
  );
};

export default PropertyCard;
