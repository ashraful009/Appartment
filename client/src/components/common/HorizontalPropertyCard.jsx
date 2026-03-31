import React from 'react';
import { MapPin, Building2 } from 'lucide-react';

const HorizontalPropertyCard = ({ property, onClick }) => {
  const { name, address, mainImage } = property;

  return (
    <div 
      onClick={onClick}
      className="flex flex-row items-center bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition cursor-pointer overflow-hidden h-32 w-full group"
    >
      {/* Left Side: Property Main Image */}
      <div className="w-1/3 h-full flex-shrink-0 bg-gray-50 border-r border-gray-100 relative">
        {mainImage ? (
          <img 
            src={mainImage} 
            alt={name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <Building2 size={32} />
          </div>
        )}
      </div>

      {/* Right Side: Property Details */}
      <div className="flex-1 p-4 flex flex-col justify-center min-w-0">
        <h3 className="font-bold text-gray-900 truncate text-lg">{name || "Unnamed Property"}</h3>
        <p className="flex items-center gap-1.5 text-gray-500 text-sm mt-1.5 truncate">
          <MapPin size={14} className="flex-shrink-0 text-brand-500" />
          <span className="truncate">{address || "No address provided"}</span>
        </p>
      </div>
    </div>
  );
};

export default HorizontalPropertyCard;
