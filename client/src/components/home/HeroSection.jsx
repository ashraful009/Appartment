import React, { useState, useEffect } from "react";
import axios from "axios";

/* ─── Skeleton ───────────────────────────────────────────────────────────── */
const HeroSkeleton = () => (
  <div
    className="w-full animate-pulse"
    style={{
      background: "linear-gradient(135deg, #040810 0%, #0A1628 50%, #122040 100%)",
      aspectRatio: "1920/700",
      minHeight: "320px",
    }}
  />
);

/* ─── Fallback Hero (no banner) ─────────────────────────────────────────── */
const FallbackHero = () => {
  const [mount, setMount] = useState(false);
  useEffect(() => { const t = setTimeout(() => setMount(true), 80); return () => clearTimeout(t); }, []);

  return (
    <div
      className="w-full relative overflow-hidden flex items-center justify-center"
      style={{
        minHeight: "clamp(320px, 60vw, 740px)",
        background: "linear-gradient(135deg, #040810 0%, #0A1628 28%, #122040 58%, #8B600A 85%, #C9942A 100%)",
      }}
    >
      {/* Decorative orbs */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: "-20%", left: "-10%",
          width: "55%", height: "70%",
          background: "radial-gradient(ellipse at center, rgba(26,48,96,0.7) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: "-20%", right: "-10%",
          width: "50%", height: "60%",
          background: "radial-gradient(ellipse at center, rgba(201,148,42,0.25) 0%, transparent 70%)",
          filter: "blur(50px)",
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          top: "40%", left: "55%",
          width: "35%", height: "40%",
          background: "radial-gradient(ellipse at center, rgba(232,184,75,0.12) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(201,148,42,0.15) 1px, transparent 1px),
            linear-gradient(90deg, rgba(201,148,42,0.15) 1px, transparent 1px)
          `,
          backgroundSize: "64px 64px",
        }}
      />

      {/* Content */}
      <div
        className="relative z-10 text-center px-6"
        style={{ maxWidth: "750px" }}
      >
        <div
          className={`transition-all duration-700 ${mount ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          style={{ transitionDelay: "100ms" }}
        >
          <div className="premium-badge mx-auto mb-6" style={{ width: "fit-content" }}>
            <span style={{ background: "linear-gradient(90deg, #C9942A, #E8B84B)", width: "6px", height: "6px", borderRadius: "50%", display: "inline-block" }} />
            Premium Real Estate · Dhaka
          </div>
        </div>

        <h1
          className={`text-white transition-all duration-700 ${mount ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: "clamp(2.5rem, 6vw, 5rem)",
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            textShadow: "0 4px 40px rgba(0,0,0,0.5)",
            transitionDelay: "200ms",
          }}
        >
          Find Your{" "}
          <em
            style={{
              fontStyle: "italic",
              background: "linear-gradient(135deg, #C9942A 0%, #E8B84B 50%, #F5D98C 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Dream
          </em>
          <br />
          Home in Bangladesh
        </h1>

        <p
          className={`transition-all duration-700 ${mount ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          style={{
            fontFamily: "'Jost', sans-serif",
            fontSize: "clamp(0.9rem, 2vw, 1.1rem)",
            color: "rgba(200,211,232,0.75)",
            marginTop: "1.25rem",
            lineHeight: 1.7,
            transitionDelay: "300ms",
          }}
        >
          Premium apartments &amp; properties curated for your aspirations.
          <br className="hidden sm:block" />
          Trusted by 850+ happy families across Bangladesh.
        </p>

        <div
          className={`flex flex-col sm:flex-row gap-4 justify-center items-center mt-10 transition-all duration-700 ${mount ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          style={{ transitionDelay: "400ms" }}
        >
          <a
            href="/properties"
            className="btn-gold w-full sm:w-auto"
            style={{ padding: "0.85rem 2.25rem", fontSize: "0.95rem" }}
          >
            Browse Properties
          </a>
          <a
            href="/register"
            className="btn-outline-gold w-full sm:w-auto"
            style={{ padding: "0.85rem 2.25rem", fontSize: "0.95rem" }}
          >
            Join Free Today
          </a>
        </div>
      </div>

      {/* Bottom fade */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{
          height: "80px",
          background: "linear-gradient(to bottom, transparent, rgba(250,247,240,1))",
        }}
      />
    </div>
  );
};

/* ─── Main HeroSection ───────────────────────────────────────────────────── */
const HeroSection = () => {
  const [banner, setBanner]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetchBanner = async () => {
      try {
        const { data } = await axios.get("/api/banners/active");
        if (!cancelled) setBanner(data.banner);
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchBanner();
    return () => { cancelled = true; };
  }, []);

  if (loading) return <HeroSkeleton />;
  if (error || !banner) return <FallbackHero />;

  const isVideo = banner.mediaType === "video";

  return (
    <div className="w-full relative overflow-hidden bg-black flex items-center justify-center">
      {/* Media */}
      {isVideo ? (
        <>
          <video className="hidden md:block w-full h-auto object-contain" src={banner.desktopMediaUrl} autoPlay loop muted playsInline />
          <video className="block   md:hidden w-full h-auto object-contain" src={banner.mobileMediaUrl}  autoPlay loop muted playsInline />
        </>
      ) : (
        <picture className="w-full">
          <source media="(max-width: 768px)" srcSet={banner.mobileMediaUrl} />
          <img
            src={banner.desktopMediaUrl}
            alt={banner.title || "Homepage banner"}
            className="w-full h-auto object-contain"
            loading="eager"
            decoding="async"
          />
        </picture>
      )}

      {/* Optional title overlay */}
      {banner.title && (
        <div className="absolute inset-0 flex items-end justify-start pointer-events-none">
          <div className="px-6 pb-8 sm:px-10 sm:pb-10">
            <h1
              className="inline-block backdrop-blur-sm font-extrabold leading-tight max-w-xl px-4 py-2 rounded-xl"
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: "clamp(1.25rem, 3vw, 2.5rem)",
                background: "rgba(250,247,240,0.85)",
                color: "#0A1628",
              }}
            >
              {banner.title}
            </h1>
          </div>
        </div>
      )}

      {/* Bottom fade into page */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{
          height: "60px",
          background: "linear-gradient(to bottom, transparent, rgba(250,247,240,1))",
        }}
      />
    </div>
  );
};

export default HeroSection;
