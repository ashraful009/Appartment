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
      className="group relative w-full flex flex-col rounded-3xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-shadow duration-500"
    >
      {/* ── Full-bleed image — height scales with screen size ────────── */}
      <div className="relative h-[180px] sm:h-[280px] md:h-[360px] lg:h-[460px] w-full overflow-hidden">
        {property.mainImage ? (
          <img
            src={property.mainImage}
            alt={property.name}
            className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
          />
        ) : (
          <div
            className={`w-full h-full bg-gradient-to-br ${color} flex items-center justify-center transition-transform duration-700 ease-in-out group-hover:scale-110`}
          >
            <Building2 size={80} className="text-white/30" />
          </div>
        )}

        {/* ── Persistent bottom gradient for text readability ── */}
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/85 via-black/40 to-transparent pointer-events-none" />

        {/* ── 2-col info strip — pinned to bottom, thin as possible ─── */}
        <div className="absolute inset-x-0 bottom-0 p-2 sm:p-3 lg:p-4 flex items-end justify-between gap-2">

          {/* LEFT — name · location · apt types */}
          <div className="flex flex-col gap-0.5 sm:gap-1 min-w-0">
            <h3 className="text-xs sm:text-base lg:text-xl font-extrabold text-white leading-tight drop-shadow-md line-clamp-1">
              {property.name}
            </h3>

            <div className="flex items-center gap-0.5 sm:gap-1 text-white/80">
              <MapPin size={9} className="flex-shrink-0 text-yellow-300 sm:w-3 sm:h-3" />
              <p className="text-[9px] sm:text-xs line-clamp-1">{property.address}</p>
            </div>

            {/* Apt size chips — up to 2, hidden on very small */}
            {property.apartmentSizes?.length > 0 && (
              <div className="hidden sm:flex flex-wrap gap-1 mt-0.5">
                {property.apartmentSizes.slice(0, 2).map((s, i) => (
                  <span
                    key={i}
                    className="bg-white/15 backdrop-blur-sm text-white text-[9px] sm:text-[10px] font-medium px-1.5 sm:px-2 py-0.5 rounded-md border border-white/20"
                  >
                    {s.type}: {s.size}
                  </span>
                ))}
                {property.apartmentSizes.length > 2 && (
                  <span className="text-white/50 text-[9px] self-center">
                    +{property.apartmentSizes.length - 2}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* RIGHT — stats badges (floors · units · handover) */}
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            {property.floors > 0 && (
              <span className="bg-white/20 backdrop-blur-sm text-white text-[9px] sm:text-[10px] font-semibold px-1.5 sm:px-2.5 py-0.5 rounded-full border border-white/20 whitespace-nowrap">
                {property.floors} floors
              </span>
            )}
            {property.totalUnits > 0 && (
              <span className="bg-white/20 backdrop-blur-sm text-white text-[9px] sm:text-[10px] font-semibold px-1.5 sm:px-2.5 py-0.5 rounded-full border border-white/20 whitespace-nowrap">
                {property.totalUnits} units
              </span>
            )}
            {property.handoverTime && (
              <span className="bg-yellow-400/90 text-yellow-900 text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2.5 py-0.5 rounded-full whitespace-nowrap">
                📅 {property.handoverTime}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
