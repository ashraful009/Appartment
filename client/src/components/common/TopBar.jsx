import React from "react";
import { Mail, Phone, MapPin, Clock, ChevronRight } from "lucide-react";

const TopBar = () => (
  <div
    className="sticky top-0 z-50 overflow-hidden"
    style={{
      background: "linear-gradient(90deg, #040810 0%, #0A1628 45%, #122040 75%, #0A1628 100%)",
      height: "var(--topbar-h, 40px)",
    }}
  >
    {/* Subtle gold shimmer line at bottom */}
    <div
      className="absolute bottom-0 left-0 right-0 h-px"
      style={{
        background:
          "linear-gradient(90deg, transparent 0%, rgba(201,148,42,0.6) 30%, rgba(232,184,75,0.9) 50%, rgba(201,148,42,0.6) 70%, transparent 100%)",
      }}
    />

    {/* Decorative gold orb */}
    <div
      className="absolute -top-6 left-1/3 w-32 h-16 opacity-5 pointer-events-none"
      style={{ background: "radial-gradient(ellipse, #E8B84B 0%, transparent 70%)" }}
    />

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
      <div className="flex items-center justify-between h-full">

        {/* LEFT — email + phone */}
        <div className="flex items-center gap-4 sm:gap-5">
          <a
            href="mailto:info@nirapodnibash.com"
            className="flex items-center gap-1.5 group transition-all duration-200"
            style={{ textDecoration: "none" }}
          >
            <Mail
              size={11}
              style={{ color: "#C9942A", flexShrink: 0, transition: "color 0.2s" }}
              className="group-hover:text-gold-300"
            />
            <span
              className="hidden sm:inline font-medium tracking-wide group-hover:text-gold-300 transition-colors duration-200"
              style={{ fontSize: "11px", color: "rgba(200,211,232,0.8)" }}
            >
              info@nirapodnibash.com
            </span>
            <span
              className="sm:hidden font-medium"
              style={{ fontSize: "11px", color: "rgba(200,211,232,0.8)" }}
            >
              Email
            </span>
          </a>

          {/* Divider dot */}
          <span
            className="hidden sm:block w-0.5 h-3 rounded-full opacity-20"
            style={{ background: "#C9942A" }}
          />

          <a
            href="tel:+8801700000000"
            className="flex items-center gap-1.5 group transition-all duration-200"
            style={{ textDecoration: "none" }}
          >
            <Phone
              size={11}
              style={{ color: "#C9942A", flexShrink: 0, transition: "color 0.2s" }}
              className="group-hover:text-gold-300"
            />
            <span
              className="font-medium tracking-wide group-hover:text-gold-300 transition-colors duration-200"
              style={{ fontSize: "11px", color: "rgba(200,211,232,0.8)" }}
            >
              +880 1700-000000
            </span>
          </a>
        </div>

        {/* CENTER — tagline (lg only) */}
        <div className="hidden lg:flex items-center gap-1.5 absolute left-1/2 -translate-x-1/2">
          <div
            className="w-1 h-1 rounded-full animate-pulse-ring"
            style={{ background: "#C9942A" }}
          />
          <span
            style={{
              fontSize: "10px",
              fontFamily: "'Jost', sans-serif",
              fontWeight: 700,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "rgba(201,148,42,0.75)",
            }}
          >
            Premium Real Estate · Dhaka, Bangladesh
          </span>
          <div
            className="w-1 h-1 rounded-full animate-pulse-ring delay-300"
            style={{ background: "#C9942A" }}
          />
        </div>

        {/* RIGHT — hours + location */}
        <div className="flex items-center gap-4 sm:gap-5">
          <div
            className="hidden md:flex items-center gap-1.5"
            style={{ color: "rgba(200,211,232,0.7)" }}
          >
            <Clock size={11} style={{ color: "#C9942A", flexShrink: 0 }} />
            <span style={{ fontSize: "11px", fontWeight: 500, letterSpacing: "0.03em" }}>
              Sat–Thu · 9 AM–7 PM
            </span>
          </div>

          <div
            className="hidden lg:flex items-center gap-1.5"
            style={{ color: "rgba(200,211,232,0.7)" }}
          >
            <MapPin size={11} style={{ color: "#C9942A", flexShrink: 0 }} />
            <span style={{ fontSize: "11px", fontWeight: 500, letterSpacing: "0.03em" }}>
              Gulshan Ave, Dhaka
            </span>
          </div>
        </div>

      </div>
    </div>
  </div>
);

export default TopBar;
