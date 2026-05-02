import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { SlidersHorizontal, Search } from "lucide-react";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";

/* ─ Color tokens (matches Home.jsx) ──────────────────────────────────────── */
const C = {
  navy:      "#0A1628",
  gold:      "#C9942A",
  goldLight: "#E8B84B",
  ivory:     "#FAF7F0",
  textMuted: "#5A4E3A",
};

const selectCls =
  "w-full bg-white border border-[#E8DFC8] rounded-xl px-3.5 py-2 text-sm text-[#0A1628] focus:outline-none focus:ring-2 focus:ring-[#C9942A]/40 focus:border-[#C9942A] transition-all appearance-none cursor-pointer";

/* ─ Price constants ──────────────────────────────────────────────────────── */
const PRICE_MIN = 2000000;   // 20 Lakh
const PRICE_MAX = 20000000;  // 2 Crore
const PRICE_STEP = 500000;   // 5 Lakh step

/* ─ Sqft constants ───────────────────────────────────────────────────────── */
const SQFT_MIN = 500;
const SQFT_MAX = 2000;
const SQFT_STEP = 50;

/* ─ Format price to human-readable BDT ───────────────────────────────────── */
const formatPrice = (val) => {
  if (val >= 10000000) {
    const crore = val / 10000000;
    return `${crore % 1 === 0 ? crore.toFixed(0) : crore.toFixed(1)} Crore`;
  }
  if (val >= 100000) {
    const lakh = val / 100000;
    return `${lakh % 1 === 0 ? lakh.toFixed(0) : lakh.toFixed(1)} Lakh`;
  }
  return val.toLocaleString("en-IN");
};

/* ─ Shared slider styles (gold theme) ────────────────────────────────────── */
const sliderTrackStyle = {
  background: "linear-gradient(90deg, #C9942A, #E8B84B)",
  height: 6,
  borderRadius: 4,
};

const sliderRailStyle = {
  background: "#E8DFC8",
  height: 6,
  borderRadius: 4,
};

const sliderHandleStyle = {
  borderColor: "#C9942A",
  backgroundColor: "#FFFFFF",
  width: 20,
  height: 20,
  marginTop: -7,
  boxShadow: "0 2px 8px rgba(201,148,42,0.35)",
  opacity: 1,
  cursor: "grab",
};

/* ─ Label styles ─────────────────────────────────────────────────────────── */
const labelStyle = {
  fontFamily: "'Jost', sans-serif",
  fontSize: "0.7rem",
  fontWeight: 700,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: C.gold,
};

const PropertyFilterSidebar = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [areas, setAreas] = useState([]);

  const [filters, setFilters] = useState({
    priceRange: [
      searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : PRICE_MIN,
      searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : PRICE_MAX,
    ],
    sqftRange: [
      searchParams.get("minSqft") ? Number(searchParams.get("minSqft")) : SQFT_MIN,
      searchParams.get("maxSqft") ? Number(searchParams.get("maxSqft")) : SQFT_MAX,
    ],
    longTerm: searchParams.get("installmentType") === "Long-term",
    shortTerm: searchParams.get("installmentType") === "Short-term",
    country: searchParams.get("country") || "",
    city: searchParams.get("city") || "",
    area: searchParams.get("area") || "",
  });

  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const { data } = await axios.get("/api/areas");
        setAreas(data.areas || []);
      } catch (err) {
        console.error("Failed to fetch areas:", err);
      }
    };
    fetchAreas();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleCountryChange = (e) => {
    setFilters((prev) => ({
      ...prev,
      country: e.target.value,
      city: "",
      area: "",
    }));
  };

  const handleCityChange = (e) => {
    setFilters((prev) => ({
      ...prev,
      city: e.target.value,
      area: "",
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();

    // Only set price params if user moved from defaults
    if (filters.priceRange[0] !== PRICE_MIN) params.set("minPrice", filters.priceRange[0]);
    if (filters.priceRange[1] !== PRICE_MAX) params.set("maxPrice", filters.priceRange[1]);
    if (filters.sqftRange[0] !== SQFT_MIN)   params.set("minSqft", filters.sqftRange[0]);
    if (filters.sqftRange[1] !== SQFT_MAX)   params.set("maxSqft", filters.sqftRange[1]);
    if (filters.country) params.set("country", filters.country);
    if (filters.city) params.set("city", filters.city);
    if (filters.area) params.set("area", filters.area);

    // Installment type logic
    if (filters.longTerm && !filters.shortTerm) {
      params.set("installmentType", "Long-term");
    } else if (filters.shortTerm && !filters.longTerm) {
      params.set("installmentType", "Short-term");
    }
    // If both checked or neither, don't filter by installment type

    navigate(`/properties/filtered?${params.toString()}`);
  };

  return (
    <div
      className="rounded-2xl p-5 sticky top-28"
      style={{
        background: "linear-gradient(180deg, #FFFFFF 0%, #FAF7F0 100%)",
        border: "1px solid rgba(201,148,42,0.18)",
        boxShadow: "0 4px 24px rgba(10,22,40,0.06)",
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-6">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, #0A1628, #1A3060)",
            boxShadow: "0 2px 8px rgba(10,22,40,0.2)",
          }}
        >
          <SlidersHorizontal size={16} style={{ color: C.gold }} />
        </div>
        <div>
          <p
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "1.15rem",
              fontWeight: 700,
              color: C.navy,
              lineHeight: 1.2,
            }}
          >
            Filter Properties
          </p>
          <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.7rem", color: C.textMuted }}>
            Refine your search
          </p>
        </div>
      </div>

      {(() => {
        const uniqueCountries = [...new Set(areas.map((a) => a.country))].filter(Boolean).sort();
        const uniqueCities = filters.country 
          ? [...new Set(areas.filter((a) => a.country === filters.country).map((a) => a.city))].filter(Boolean).sort()
          : [];
        const filteredAreas = filters.city 
          ? areas.filter((a) => a.country === filters.country && a.city === filters.city).sort((a, b) => a.name.localeCompare(b.name))
          : [];

        return (
          <form onSubmit={handleSubmit} className="space-y-5">

        {/* ── Price Range Slider ─────────────────────────────────────────── */}
        <div>
          <label className="block mb-2" style={labelStyle}>
            Price Range (BDT)
          </label>

          {/* Dynamic value display */}
          <div
            className="flex items-center justify-between mb-3 px-1"
            style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.78rem" }}
          >
            <span
              className="px-2.5 py-1 rounded-lg"
              style={{
                background: "rgba(201,148,42,0.10)",
                color: C.navy,
                fontWeight: 600,
                border: "1px solid rgba(201,148,42,0.15)",
              }}
            >
              ৳{formatPrice(filters.priceRange[0])}
            </span>
            <span
              style={{
                color: C.textMuted,
                fontSize: "0.65rem",
                fontWeight: 500,
                letterSpacing: "0.08em",
              }}
            >
              TO
            </span>
            <span
              className="px-2.5 py-1 rounded-lg"
              style={{
                background: "rgba(201,148,42,0.10)",
                color: C.navy,
                fontWeight: 600,
                border: "1px solid rgba(201,148,42,0.15)",
              }}
            >
              ৳{formatPrice(filters.priceRange[1])}
            </span>
          </div>

          {/* Dual-thumb slider */}
          <div className="px-1.5">
            <Slider
              range
              min={PRICE_MIN}
              max={PRICE_MAX}
              step={PRICE_STEP}
              value={filters.priceRange}
              onChange={(val) =>
                setFilters((prev) => ({ ...prev, priceRange: val }))
              }
              trackStyle={[sliderTrackStyle]}
              railStyle={sliderRailStyle}
              handleStyle={[sliderHandleStyle, sliderHandleStyle]}
              allowCross={false}
            />
          </div>

          {/* Min / Max labels */}
          <div
            className="flex justify-between mt-1.5 px-1"
            style={{
              fontFamily: "'Jost', sans-serif",
              fontSize: "0.6rem",
              color: C.textMuted,
              letterSpacing: "0.05em",
            }}
          >
            <span>20 Lakh</span>
            <span>2 Crore</span>
          </div>
        </div>

        {/* ── Square Feet Range Slider ───────────────────────────────────── */}
        <div>
          <label className="block mb-2" style={labelStyle}>
            Square Feet
          </label>

          {/* Dynamic value display */}
          <div
            className="flex items-center justify-between mb-3 px-1"
            style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.78rem" }}
          >
            <span
              className="px-2.5 py-1 rounded-lg"
              style={{
                background: "rgba(201,148,42,0.10)",
                color: C.navy,
                fontWeight: 600,
                border: "1px solid rgba(201,148,42,0.15)",
              }}
            >
              {filters.sqftRange[0].toLocaleString()} sqft
            </span>
            <span
              style={{
                color: C.textMuted,
                fontSize: "0.65rem",
                fontWeight: 500,
                letterSpacing: "0.08em",
              }}
            >
              TO
            </span>
            <span
              className="px-2.5 py-1 rounded-lg"
              style={{
                background: "rgba(201,148,42,0.10)",
                color: C.navy,
                fontWeight: 600,
                border: "1px solid rgba(201,148,42,0.15)",
              }}
            >
              {filters.sqftRange[1].toLocaleString()} sqft
            </span>
          </div>

          {/* Dual-thumb slider */}
          <div className="px-1.5">
            <Slider
              range
              min={SQFT_MIN}
              max={SQFT_MAX}
              step={SQFT_STEP}
              value={filters.sqftRange}
              onChange={(val) =>
                setFilters((prev) => ({ ...prev, sqftRange: val }))
              }
              trackStyle={[sliderTrackStyle]}
              railStyle={sliderRailStyle}
              handleStyle={[sliderHandleStyle, sliderHandleStyle]}
              allowCross={false}
            />
          </div>

          {/* Min / Max labels */}
          <div
            className="flex justify-between mt-1.5 px-1"
            style={{
              fontFamily: "'Jost', sans-serif",
              fontSize: "0.6rem",
              color: C.textMuted,
              letterSpacing: "0.05em",
            }}
          >
            <span>500 sqft</span>
            <span>2,000 sqft</span>
          </div>
        </div>

        {/* Installment Toggles */}
        <div>
          <label
            className="block mb-2.5"
            style={labelStyle}
          >
            Installment Type
          </label>
          <div className="space-y-2">
            {[
              { name: "longTerm", label: "Long-term Installment" },
              { name: "shortTerm", label: "Short-term Installment" },
            ].map(({ name, label }) => (
              <label
                key={name}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <div className="relative">
                  <input
                    type="checkbox"
                    name={name}
                    checked={filters[name]}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div
                    className="w-9 h-5 rounded-full transition-all duration-300 peer-checked:bg-[#C9942A]"
                    style={{
                      background: filters[name]
                        ? "linear-gradient(135deg, #C9942A, #E8B84B)"
                        : "#E8DFC8",
                    }}
                  />
                  <div
                    className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300"
                    style={{
                      transform: filters[name] ? "translateX(16px)" : "translateX(0)",
                    }}
                  />
                </div>
                <span
                  style={{
                    fontFamily: "'Jost', sans-serif",
                    fontSize: "0.82rem",
                    fontWeight: 500,
                    color: C.navy,
                  }}
                >
                  {label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Country Dropdown */}
        <div>
          <label className="block mb-2" style={labelStyle}>
            Country
          </label>
          <select
            name="country"
            value={filters.country}
            onChange={handleCountryChange}
            className={selectCls}
          >
            <option value="">All Countries</option>
            {uniqueCountries.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* City Dropdown */}
        <div>
          <label className="block mb-2" style={labelStyle}>
            City
          </label>
          <select
            name="city"
            value={filters.city}
            onChange={handleCityChange}
            disabled={!filters.country}
            className={`${selectCls} disabled:opacity-50`}
          >
            <option value="">All Cities</option>
            {uniqueCities.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Area Dropdown */}
        <div>
          <label className="block mb-2" style={labelStyle}>
            Area
          </label>
          <select
            name="area"
            value={filters.area}
            onChange={handleChange}
            disabled={!filters.city}
            className={`${selectCls} disabled:opacity-50`}
          >
            <option value="">All Areas</option>
            {filteredAreas.map((a) => (
              <option key={a._id} value={a._id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-[#C9942A]/20 active:scale-[0.98]"
          style={{
            fontFamily: "'Jost', sans-serif",
            background: "linear-gradient(135deg, #0A1628 0%, #1A3060 100%)",
            color: "#FFFFFF",
            border: "1px solid rgba(201,148,42,0.3)",
          }}
        >
          <Search size={15} style={{ color: C.goldLight }} />
          Search Properties
        </button>
          </form>
        );
      })()}
    </div>
  );
};

export default PropertyFilterSidebar;
