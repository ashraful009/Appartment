import React from "react";
import { MapPin, Mail, Phone, Building2 } from "lucide-react";
import ConversionToggle from "./ConversionToggle";

const ClaimedRow = ({ req, onStatusChange }) => {
  const { property, user } = req;
  return (
    <tr className="hover:bg-gray-50/70 transition-colors border-b border-gray-100 last:border-b-0">
      {/* Property */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          {property?.mainImage ? (
            <img
              src={property.mainImage}
              alt={property.name}
              className="w-12 h-12 rounded-xl object-cover flex-shrink-0 border border-gray-200"
            />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-brand-800 flex items-center justify-center flex-shrink-0">
              <Building2 size={20} className="text-white/60" />
            </div>
          )}
          <div className="min-w-0">
            <p className="font-semibold text-gray-800 text-sm truncate max-w-[160px]">
              {property?.name || "—"}
            </p>
            <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
              <MapPin size={10} className="text-brand-400" />
              <span className="truncate max-w-[140px]">{property?.address || "—"}</span>
            </p>
          </div>
        </div>
      </td>

      {/* User Name */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-xs flex-shrink-0">
            {user?.name?.[0]?.toUpperCase() ?? "?"}
          </div>
          <span className="text-sm font-semibold text-gray-800">{user?.name || "—"}</span>
        </div>
      </td>

      {/* Email */}
      <td className="px-5 py-4">
        {user?.email ? (
          <a
            href={`mailto:${user.email}`}
            className="flex items-center gap-1.5 text-sm text-brand-600 hover:text-brand-800 font-medium transition-colors"
          >
            <Mail size={13} className="flex-shrink-0" />
            {user.email}
          </a>
        ) : (
          <span className="text-gray-300 text-sm italic">—</span>
        )}
      </td>

      {/* Phone */}
      <td className="px-5 py-4">
        {user?.phone ? (
          <a
            href={`tel:${user.phone}`}
            className="flex items-center gap-1.5 text-sm text-emerald-600 hover:text-emerald-800 font-semibold transition-colors"
          >
            <Phone size={13} className="flex-shrink-0" />
            {user.phone}
          </a>
        ) : (
          <span className="text-gray-300 text-sm italic">N/A</span>
        )}
      </td>

      {/* Claimed Date */}
      <td className="px-5 py-4 text-xs text-gray-400 whitespace-nowrap">
        {new Date(req.updatedAt).toLocaleDateString("en-GB", {
          day: "2-digit", month: "short", year: "numeric",
        })}
      </td>

      {/* Accept as Customer */}
      <td className="px-5 py-4">
        <ConversionToggle req={req} onStatusChange={onStatusChange} />
      </td>
    </tr>
  );
};

export default ClaimedRow;
