import React from "react";
import { Mail, Phone, MapPin } from "lucide-react";

const TopBar = () => {
  return (
    <div className="bg-brand-950 text-gray-300 py-2 px-4 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1 sm:gap-0 text-xs sm:text-sm">
        {/* Email */}
        <a
          href="mailto:info@appartment.com"
          className="flex items-center gap-1.5 hover:text-white transition-colors duration-200 group"
        >
          <Mail size={13} className="text-brand-400 group-hover:text-white transition-colors" />
          <span className="hidden sm:inline">info@appartment.com</span>
          <span className="sm:hidden">Email Us</span>
        </a>

        {/* Phone */}
        <a
          href="tel:+8801700000000"
          className="flex items-center gap-1.5 hover:text-white transition-colors duration-200 group"
        >
          <Phone size={13} className="text-brand-400 group-hover:text-white transition-colors" />
          <span>+880 1700-000000</span>
        </a>

        {/* Location */}
        <div className="hidden md:flex items-center gap-1.5">
          <MapPin size={13} className="text-brand-400" />
          <span>123 Gulshan Ave, Dhaka, Bangladesh</span>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
