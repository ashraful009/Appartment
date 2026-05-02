import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, Building2, Zap } from "lucide-react";
import PropertyCard from "../../components/common/PropertyCard";
import { PropertyGridSkeleton } from "../../components/common/SkeletonLoader";

const C = {
  navy: "#0A1628", navyLight: "#1A3060",
  gold: "#C9942A", goldLight: "#E8B84B",
  ivory: "#FAF7F0", textMuted: "#5A4E3A",
};

const STATUS_TABS = ["All", "Ongoing", "Completed", "Upcoming"];

const ShortTermProperties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState("All");

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await axios.get("/api/properties/public?installmentType=Short-term&noPaginate=true");
        setProperties(data.properties || []);
      } catch (err) {
        console.error("Failed to fetch short-term properties:", err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const filteredProperties = useMemo(() => {
    if (activeStatus === "All") return properties;
    return properties.filter((p) => p.status === activeStatus);
  }, [properties, activeStatus]);

  return (
    <div className="min-h-screen" style={{ background: C.ivory, fontFamily: "'Jost', sans-serif" }}>

      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${C.navy} 0%, ${C.navyLight} 60%, #2A4A7A 100%)`,
          paddingTop: "clamp(100px, 14vw, 140px)",
          paddingBottom: "clamp(48px, 8vw, 72px)",
        }}
      >
        <div
          className="absolute pointer-events-none"
          style={{
            top: "-30%", left: "-10%", width: "50%", height: "80%",
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

          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: "rgba(201,148,42,0.15)",
                border: "1px solid rgba(201,148,42,0.3)",
              }}
            >
              <Zap size={18} style={{ color: C.goldLight }} />
            </div>
            <span
              className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
              style={{
                background: "rgba(201,148,42,0.12)",
                border: "1px solid rgba(201,148,42,0.3)",
                color: C.goldLight,
                letterSpacing: "0.15em",
              }}
            >
              Short-term Installment
            </span>
          </div>

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
            Short-term{" "}
            <em
              style={{
                fontStyle: "italic",
                background: `linear-gradient(135deg, ${C.gold}, ${C.goldLight})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Installment
            </em>{" "}
            Properties
          </h1>
          <p
            style={{
              fontFamily: "'Jost', sans-serif",
              fontSize: "clamp(0.85rem, 1.5vw, 1rem)",
              color: "rgba(200,211,232,0.65)",
              marginTop: "10px",
              maxWidth: "520px",
            }}
          >
            Quick possession with shorter payment commitments. Browse all available properties.
          </p>
        </div>

        <div
          className="absolute bottom-0 left-0 right-0 pointer-events-none"
          style={{ height: "60px", background: `linear-gradient(to bottom, transparent, ${C.ivory})` }}
        />
      </div>

      {/* ── Status Tabs + Grid ───────────────────────────────────────────── */}
      <div className="section-wrap py-10 sm:py-14">

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
                  background: isActive ? `linear-gradient(135deg, ${C.navy}, ${C.navyLight})` : "transparent",
                  color: isActive ? "#FFFFFF" : C.textMuted,
                  border: isActive ? "1px solid rgba(201,148,42,0.3)" : "1px solid transparent",
                  boxShadow: isActive ? "0 4px 16px rgba(10,22,40,0.15)" : "none",
                }}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {loading ? (
          <PropertyGridSkeleton count={6} />
        ) : filteredProperties.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div
              className="w-20 h-20 rounded-3xl flex items-center justify-center mb-5"
              style={{ background: "rgba(201,148,42,0.08)", border: "1px solid rgba(201,148,42,0.15)" }}
            >
              <Building2 size={36} style={{ color: C.gold }} />
            </div>
            <h3
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: "1.5rem", fontWeight: 700, color: C.navy, marginBottom: "8px",
              }}
            >
              No Properties Found
            </h3>
            <p style={{ fontSize: "0.875rem", color: C.textMuted, maxWidth: "320px" }}>
              {activeStatus !== "All"
                ? `No ${activeStatus.toLowerCase()} short-term installment properties available.`
                : "No short-term installment properties available yet."}
            </p>
            <Link to="/" className="mt-6 btn-gold" style={{ textDecoration: "none", padding: "0.7rem 2rem" }}>
              Back to Home
            </Link>
          </div>
        ) : (
          <>
            <p className="mb-5" style={{ fontSize: "0.875rem", color: C.textMuted, fontWeight: 500 }}>
              Showing <strong style={{ color: C.navy }}>{filteredProperties.length}</strong>{" "}
              {filteredProperties.length === 1 ? "property" : "properties"}
              {activeStatus !== "All" && (
                <span> · Status: <strong style={{ color: C.gold }}>{activeStatus}</strong></span>
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
  );
};

export default ShortTermProperties;
