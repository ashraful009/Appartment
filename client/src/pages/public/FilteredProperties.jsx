import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, SlidersHorizontal, Loader2, Building2 } from "lucide-react";
import PropertyCard from "../../components/common/PropertyCard";
import { PropertyGridSkeleton } from "../../components/common/SkeletonLoader";
import PropertyFilterSidebar from "../../components/home/PropertyFilterSidebar";

/* ─ Color tokens ────────────────────────────────────────────────────────── */
const C = {
  navy:      "#0A1628",
  navyLight: "#1A3060",
  gold:      "#C9942A",
  goldLight: "#E8B84B",
  ivory:     "#FAF7F0",
  textMuted: "#5A4E3A",
};

const STATUS_TABS = ["All", "Ongoing", "Completed", "Upcoming"];

const FilteredProperties = () => {
  const [searchParams] = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState("All");

  // Extract query params
  const minPrice        = searchParams.get("minPrice") || "";
  const maxPrice        = searchParams.get("maxPrice") || "";
  const minSqft         = searchParams.get("minSqft") || "";
  const maxSqft         = searchParams.get("maxSqft") || "";
  const country         = searchParams.get("country") || "";
  const city            = searchParams.get("city") || "";
  const area            = searchParams.get("area") || "";
  const installmentType = searchParams.get("installmentType") || "";

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("noPaginate", "true");
        if (minPrice)        params.set("minPrice", minPrice);
        if (maxPrice)        params.set("maxPrice", maxPrice);
        if (minSqft)         params.set("minSqft", minSqft);
        if (maxSqft)         params.set("maxSqft", maxSqft);
        if (country)         params.set("country", country);
        if (city)            params.set("city", city);
        if (area)            params.set("area", area);
        if (installmentType) params.set("installmentType", installmentType);

        const { data } = await axios.get(`/api/properties/public?${params.toString()}`);
        setProperties(data.properties || []);
      } catch (err) {
        console.error("Failed to fetch filtered properties:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, [minPrice, maxPrice, minSqft, maxSqft, country, city, area, installmentType]);

  // Client-side status filtering
  const filteredProperties = useMemo(() => {
    if (activeStatus === "All") return properties;
    return properties.filter((p) => p.status === activeStatus);
  }, [properties, activeStatus]);

  // Build human-readable active filters summary
  const filterSummary = useMemo(() => {
    const parts = [];
    if (minPrice || maxPrice) {
      parts.push(`Price: ${minPrice || "0"} – ${maxPrice || "∞"} BDT`);
    }
    if (minSqft || maxSqft) {
      parts.push(`Size: ${minSqft || "0"} – ${maxSqft || "∞"} sqft`);
    }
    if (country) parts.push(country);
    if (city) parts.push(city);
    if (installmentType) parts.push(installmentType);
    return parts;
  }, [minPrice, maxPrice, minSqft, maxSqft, country, city, installmentType]);

  return (
    <div className="min-h-screen" style={{ background: C.ivory, fontFamily: "'Jost', sans-serif" }}>

      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${C.navy} 0%, ${C.navyLight} 60%, #2A4A7A 100%)`,
          paddingTop: "clamp(100px, 14vw, 140px)",
          paddingBottom: "clamp(48px, 8vw, 72px)",
        }}
      >
        {/* Decorative orbs */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: "-30%", right: "-10%", width: "50%", height: "80%",
            background: "radial-gradient(ellipse, rgba(201,148,42,0.12), transparent 70%)",
            filter: "blur(60px)",
          }}
        />
        <div className="section-wrap relative z-10">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium mb-6 transition-colors duration-200"
            style={{ color: "rgba(232,184,75,0.7)", textDecoration: "none" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = C.goldLight)}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(232,184,75,0.7)")}
          >
            <ArrowLeft size={15} />
            Back to Home
          </Link>

          <h1
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "clamp(1.8rem, 5vw, 3rem)",
              fontWeight: 700,
              color: "#FFFFFF",
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
            }}
          >
            Filtered{" "}
            <em
              style={{
                fontStyle: "italic",
                background: `linear-gradient(135deg, ${C.gold}, ${C.goldLight})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Properties
            </em>
          </h1>

          {filterSummary.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {filterSummary.map((s, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                  style={{
                    background: "rgba(201,148,42,0.12)",
                    border: "1px solid rgba(201,148,42,0.3)",
                    color: C.goldLight,
                  }}
                >
                  <SlidersHorizontal size={11} />
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Bottom fade */}
        <div
          className="absolute bottom-0 left-0 right-0 pointer-events-none"
          style={{
            height: "60px",
            background: `linear-gradient(to bottom, transparent, ${C.ivory})`,
          }}
        />
      </div>

      {/* ── Main Content ──────────────────────────────────────────────── */}
      <div className="section-wrap py-10 sm:py-14">

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Sidebar Filter */}
          <div className="w-full lg:w-72 flex-shrink-0">
            <PropertyFilterSidebar />
          </div>

          {/* Right Content */}
          <div className="flex-1 min-w-0">

            {/* Status Tab Bar */}
            <div className="flex items-center gap-1.5 mb-8 overflow-x-auto pb-1">
          {STATUS_TABS.map((tab) => {
            const isActive = activeStatus === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveStatus(tab)}
                className="px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-300 whitespace-nowrap"
                style={{
                  fontFamily: "'Jost', sans-serif",
                  background: isActive
                    ? `linear-gradient(135deg, ${C.navy}, ${C.navyLight})`
                    : "transparent",
                  color: isActive ? "#FFFFFF" : C.textMuted,
                  border: isActive
                    ? `1px solid rgba(201,148,42,0.3)`
                    : "1px solid transparent",
                  boxShadow: isActive ? "0 4px 16px rgba(10,22,40,0.15)" : "none",
                }}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Results */}
        {loading ? (
          <PropertyGridSkeleton count={6} />
        ) : filteredProperties.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div
              className="w-20 h-20 rounded-3xl flex items-center justify-center mb-5"
              style={{
                background: "rgba(201,148,42,0.08)",
                border: "1px solid rgba(201,148,42,0.15)",
              }}
            >
              <Building2 size={36} style={{ color: C.gold }} />
            </div>
            <h3
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: "1.5rem",
                fontWeight: 700,
                color: C.navy,
                marginBottom: "8px",
              }}
            >
              No Properties Found
            </h3>
            <p style={{ fontSize: "0.875rem", color: C.textMuted, maxWidth: "320px" }}>
              Try adjusting your filters or browse all available properties.
            </p>
            <Link
              to="/"
              className="mt-6 btn-gold"
              style={{ textDecoration: "none", padding: "0.7rem 2rem" }}
            >
              Back to Home
            </Link>
          </div>
        ) : (
          <>
            <p
              className="mb-5"
              style={{ fontSize: "0.875rem", color: C.textMuted, fontWeight: 500 }}
            >
              Showing <strong style={{ color: C.navy }}>{filteredProperties.length}</strong>{" "}
              {filteredProperties.length === 1 ? "property" : "properties"}
              {activeStatus !== "All" && (
                <span>
                  {" "}· Status: <strong style={{ color: C.gold }}>{activeStatus}</strong>
                </span>
              )}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5 lg:gap-8">
              {filteredProperties.map((property, i) => (
                <PropertyCard key={property._id} property={property} index={i} />
              ))}
            </div>
          </>
        )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilteredProperties;
