import React from "react";
import { Building2, MapPin, CalendarClock, KeyRound } from "lucide-react";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const fmtHandover = (m, y) => (m && y ? `${MONTHS[m - 1]} ${y}` : "To be announced");


const AllocatedUnitCard = ({ unit }) => {
  if (!unit) return null;
  const property = unit.propertyId || {};

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        <div className="w-full sm:w-40 h-32 sm:h-auto bg-gray-100 shrink-0">
          {property.mainImage ? (
            <img src={property.mainImage} alt={property.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Building2 size={28} className="text-gray-300" />
            </div>
          )}
        </div>

        <div className="p-5 flex-1">
          <div className="flex items-center gap-2 text-brand-600 mb-1">
            <KeyRound size={15} />
            <span className="text-xs font-bold uppercase tracking-wide">Your Allocated Unit</span>
          </div>
          <h3 className="text-lg font-extrabold text-gray-900">
            Unit {unit.unitName} <span className="text-gray-400 font-semibold text-sm">· Floor {unit.floor}</span>
          </h3>
          <p className="text-sm font-semibold text-gray-700 mt-0.5">{property.name || "—"}</p>
          {property.address && (
            <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
              <MapPin size={12} /> {property.address}
            </p>
          )}
          <div className="mt-3 inline-flex items-center gap-1.5 bg-brand-50 text-brand-700 rounded-lg px-3 py-1.5 text-sm font-semibold">
            <CalendarClock size={14} /> Handover: {fmtHandover(unit.handoverMonth, unit.handoverYear)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllocatedUnitCard;
