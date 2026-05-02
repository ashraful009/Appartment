import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronRight } from "lucide-react";
import PropertyCard from "../common/PropertyCard";
import { PropertyGridSkeleton } from "../common/SkeletonLoader";
import { Building2 } from "lucide-react";

/* ─ Color tokens ────────────────────────────────────────────────────────── */
const C = {
  navy:      "#0A1628",
  gold:      "#C9942A",
  goldLight: "#E8B84B",
  textMuted: "#5A4E3A",
};

const PropertyCarousel = ({ title, subtitle, properties, loading, viewAllLink }) => {
  const scrollRef = useRef(null);

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 360, behavior: "smooth" });
    }
  };

  return (
    <div className="mb-12">
      {/* Section Header */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <h3
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "clamp(1.3rem, 3vw, 1.75rem)",
              fontWeight: 700,
              color: C.navy,
              letterSpacing: "-0.01em",
              lineHeight: 1.2,
            }}
          >
            {title}
          </h3>
          {subtitle && (
            <p
              style={{
                fontFamily: "'Jost', sans-serif",
                fontSize: "0.82rem",
                color: C.textMuted,
                marginTop: "4px",
              }}
            >
              {subtitle}
            </p>
          )}
        </div>

        {/* Scroll Arrow */}
        {!loading && properties?.length > 0 && (
          <button
            onClick={scrollRight}
            className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
            style={{
              background: "linear-gradient(135deg, #0A1628, #1A3060)",
              border: "1px solid rgba(201,148,42,0.3)",
              boxShadow: "0 2px 12px rgba(10,22,40,0.15)",
            }}
            aria-label="Scroll right"
          >
            <ChevronRight size={18} style={{ color: C.goldLight }} />
          </button>
        )}
      </div>

      {/* Carousel Content */}
      {loading ? (
        <PropertyGridSkeleton count={3} />
      ) : !properties || properties.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: "rgba(201,148,42,0.08)", border: "1px solid rgba(201,148,42,0.15)" }}
          >
            <Building2 size={28} style={{ color: C.gold }} />
          </div>
          <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.875rem", color: C.textMuted }}>
            No properties available in this category yet.
          </p>
        </div>
      ) : (
        <>
          {/* Scrollable Row */}
          <div
            ref={scrollRef}
            className="flex gap-4 sm:gap-5 overflow-x-auto pb-4 scrollbar-hide"
            style={{
              scrollSnapType: "x mandatory",
              WebkitOverflowScrolling: "touch",
              msOverflowStyle: "none",
              scrollbarWidth: "none",
            }}
          >
            {properties.map((property, i) => (
              <div
                key={property._id}
                className="flex-shrink-0"
                style={{
                  width: "clamp(260px, 30vw, 340px)",
                  scrollSnapAlign: "start",
                }}
              >
                <PropertyCard property={property} index={i} />
              </div>
            ))}
          </div>

          {/* View All Button */}
          {viewAllLink && (
            <div className="flex justify-center mt-6">
              <Link
                to={viewAllLink}
                className="group flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-[#C9942A]/15"
                style={{
                  fontFamily: "'Jost', sans-serif",
                  background: "linear-gradient(135deg, rgba(201,148,42,0.08), rgba(201,148,42,0.04))",
                  border: "1px solid rgba(201,148,42,0.25)",
                  color: C.navy,
                  textDecoration: "none",
                }}
              >
                View All Properties
                <ArrowRight
                  size={15}
                  className="group-hover:translate-x-1 transition-transform duration-200"
                  style={{ color: C.gold }}
                />
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PropertyCarousel;
