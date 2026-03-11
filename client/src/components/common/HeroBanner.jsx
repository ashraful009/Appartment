import React, { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Phone, Info } from "lucide-react";

const SLIDE_INTERVAL = 5000; // ms between auto-slides

// Fallback placeholder when no banner is uploaded yet
const FALLBACK = {
  images: [],
  motivationalText: "Find Your Dream Home",
  contactInfo: "+880 1700-000000 | info@appartment.com",
};

const HeroBanner = ({ banner }) => {
  const data          = banner || FALLBACK;
  const images        = data.images?.length ? data.images : null;
  const [current, setCurrent] = useState(0);
  const total = images?.length || 0;

  // Auto-advance
  const next = useCallback(() => setCurrent((c) => (c + 1) % total), [total]);
  const prev = () => setCurrent((c) => (c - 1 + total) % total);

  useEffect(() => {
    if (total <= 1) return;
    const id = setInterval(next, SLIDE_INTERVAL);
    return () => clearInterval(id);
  }, [next, total]);

  // ── No images → gradient hero ──────────────────────────────────────────
  if (!images) {
    return (
      <section className="relative h-[520px] sm:h-[600px] bg-gradient-to-br from-brand-800 via-brand-700 to-brand-500 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-300 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 text-center px-6">
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white leading-tight drop-shadow-xl">
            {data.motivationalText}
          </h1>
          {data.contactInfo && (
            <p className="mt-6 text-white/80 text-base sm:text-lg font-medium flex items-center justify-center gap-2">
              <Phone size={16} className="flex-shrink-0" />
              {data.contactInfo}
            </p>
          )}
        </div>
      </section>
    );
  }

  // ── With images → sliding carousel ────────────────────────────────────
  return (
    <section className="relative h-[520px] sm:h-[620px] overflow-hidden select-none">
      {/* Slides */}
      {images.map((src, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            i === current ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          <img
            src={src}
            alt={`Banner slide ${i + 1}`}
            className="w-full h-full object-cover"
          />
          {/* Dark gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-black/20" />
        </div>
      ))}

      {/* ── Motivational text — center ── */}
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center px-6 text-center pointer-events-none">
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight drop-shadow-2xl max-w-4xl">
          {data.motivationalText}
        </h1>
      </div>

      {/* ── Contact info — bottom left ── */}
      {data.contactInfo && (
        <div className="absolute bottom-6 left-6 z-20 flex items-center gap-2 bg-black/40 backdrop-blur-sm text-white text-sm px-4 py-2.5 rounded-full border border-white/20 shadow-lg">
          <Phone size={14} className="flex-shrink-0 text-yellow-300" />
          <span className="font-medium">{data.contactInfo}</span>
        </div>
      )}

      {/* ── Slide counter — bottom right ── */}
      {total > 1 && (
        <div className="absolute bottom-6 right-6 z-20 flex items-center gap-1.5">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === current ? "w-6 bg-white" : "w-1.5 bg-white/40 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      )}

      {/* ── Prev / Next arrows ── */}
      {total > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-black/30 hover:bg-black/60 backdrop-blur-sm text-white rounded-full flex items-center justify-center transition-all duration-200 border border-white/20"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-black/30 hover:bg-black/60 backdrop-blur-sm text-white rounded-full flex items-center justify-center transition-all duration-200 border border-white/20"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}
    </section>
  );
};

export default HeroBanner;
