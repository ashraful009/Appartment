import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import {
  ArrowRight, CheckCircle, Building2, Users, MapPin,
  Award, Phone, Mail, Star, Shield, Clock, TrendingUp,
} from "lucide-react";
import HeroSection   from "../../components/home/HeroSection";
import PropertyGrid  from "../../components/common/PropertyGrid";
import Pagination    from "../../components/common/Pagination";

/* ─ Color tokens ─────────────────────────────────────────────────────────── */
const C = {
  navy:       "#0A1628",
  navyMid:    "#122040",
  navyLight:  "#1A3060",
  gold:       "#C9942A",
  goldLight:  "#E8B84B",
  goldPale:   "#F5D98C",
  ivory:      "#FAF7F0",
  ivoryWarm:  "#F2EDE0",
  ivoryDeep:  "#E8DFC8",
  text:       "#0A1628",
  textMuted:  "#5A4E3A",
};

/* ─ Stats data ───────────────────────────────────────────────────────────── */
const STATS = [
  { value: "1,200+", label: "Properties Listed",  icon: Building2 },
  { value: "850+",   label: "Happy Families",      icon: Users     },
  { value: "30+",    label: "Cities Covered",      icon: MapPin    },
  { value: "10+",    label: "Years of Trust",       icon: Award     },
];

/* ─ Features ─────────────────────────────────────────────────────────────── */
const FEATURES = [
  {
    title: "Verified Listings",
    desc:  "Every property is thoroughly vetted and legally verified before it reaches your screen.",
    icon:  Shield,
    color: "#1A3060",
  },
  {
    title: "Expert Agents",
    desc:  "Our seasoned professionals guide you seamlessly from first search to final handover.",
    icon:  Star,
    color: "#C9942A",
  },
  {
    title: "Transparent Pricing",
    desc:  "Complete cost breakdowns upfront — zero hidden fees, zero surprises at closing.",
    icon:  TrendingUp,
    color: "#1A3060",
  },
  {
    title: "On-Time Handover",
    desc:  "We stand firmly behind every promise — delivered on schedule, every single time.",
    icon:  Clock,
    color: "#C9942A",
  },
];

/* ─ Testimonials ─────────────────────────────────────────────────────────── */
const TESTIMONIALS = [
  {
    name:    "Rahim & Nusrat Ahmed",
    role:    "Homeowners · Bashundhara R/A",
    quote:   "Nirapod Nibash made our apartment dream a reality. The entire process was transparent and the team was incredibly supportive.",
    rating:  5,
    avatar:  "R",
  },
  {
    name:    "Dr. Kamal Hossain",
    role:    "Investor · Gulshan",
    quote:   "I've bought three units through them. The legal verification process is unmatched in Bangladesh's real estate market.",
    rating:  5,
    avatar:  "K",
  },
  {
    name:    "Sultana Begum",
    role:    "First-time Buyer · Mirpur",
    quote:   "As a first-time buyer I was nervous, but their agents walked me through every step. Truly a premium experience.",
    rating:  5,
    avatar:  "S",
  },
];

/* ─ Animated counter hook ────────────────────────────────────────────────── */
function useInView(ref) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold: 0.2 }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [ref]);
  return inView;
}

/* ─ StatCard ─────────────────────────────────────────────────────────────── */
const StatCard = ({ stat, delay }) => {
  const ref  = useRef(null);
  const Icon = stat.icon;
  const vis  = useInView(ref);
  return (
    <div
      ref={ref}
      className="flex flex-col items-center text-center px-4 py-8 sm:py-10 group"
      style={{
        borderRight: "1px solid rgba(255,255,255,0.07)",
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
        opacity: vis ? 1 : 0,
        transform: vis ? "translateY(0)" : "translateY(20px)",
      }}
    >
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110"
        style={{
          background: "rgba(201,148,42,0.12)",
          border: "1px solid rgba(201,148,42,0.25)",
          boxShadow: "0 0 20px rgba(201,148,42,0.1)",
        }}
      >
        <Icon size={24} style={{ color: C.goldLight }} />
      </div>
      <p
        style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: "clamp(2rem, 4vw, 3rem)",
          fontWeight: 700,
          color: "#FFFFFF",
          lineHeight: 1,
          marginBottom: "4px",
        }}
      >
        {stat.value}
      </p>
      <p
        style={{
          fontFamily: "'Jost', sans-serif",
          fontSize: "0.8rem",
          fontWeight: 500,
          letterSpacing: "0.06em",
          color: "rgba(200,211,232,0.7)",
          textTransform: "uppercase",
          marginTop: "6px",
        }}
      >
        {stat.label}
      </p>
    </div>
  );
};

/* ─ FeatureCard ──────────────────────────────────────────────────────────── */
const FeatureCard = ({ f, i }) => {
  const ref  = useRef(null);
  const Icon = f.icon;
  const vis  = useInView(ref);
  return (
    <div
      ref={ref}
      className="feature-card group"
      style={{
        transition: `opacity 0.6s ease ${i * 120}ms, transform 0.6s ease ${i * 120}ms`,
        opacity: vis ? 1 : 0,
        transform: vis ? "translateY(0)" : "translateY(24px)",
      }}
    >
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-all duration-300 group-hover:scale-110"
        style={{
          background: `linear-gradient(135deg, ${f.color}15, ${f.color}08)`,
          border: `1px solid ${f.color}25`,
        }}
      >
        <Icon size={24} style={{ color: f.color }} />
      </div>
      <h3
        style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: "1.3rem",
          fontWeight: 700,
          color: C.navy,
          marginBottom: "10px",
        }}
      >
        {f.title}
      </h3>
      <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.875rem", color: C.textMuted, lineHeight: 1.7 }}>
        {f.desc}
      </p>
      <div
        className="mt-4 h-0.5 w-0 group-hover:w-12 rounded-full transition-all duration-400"
        style={{ background: `linear-gradient(90deg, ${C.gold}, ${C.goldLight})` }}
      />
    </div>
  );
};

/* ─ TestimonialCard ──────────────────────────────────────────────────────── */
const TestimonialCard = ({ t, i }) => {
  const ref = useRef(null);
  const vis = useInView(ref);
  return (
    <div
      ref={ref}
      className="rounded-2xl p-7 flex flex-col"
      style={{
        background: "#FFFFFF",
        border: "1px solid rgba(201,148,42,0.15)",
        boxShadow: "0 4px 24px rgba(10,22,40,0.06)",
        transition: `opacity 0.6s ease ${i * 150}ms, transform 0.6s ease ${i * 150}ms`,
        opacity: vis ? 1 : 0,
        transform: vis ? "translateY(0)" : "translateY(28px)",
      }}
    >
      {/* Stars */}
      <div className="flex gap-1 mb-4">
        {[...Array(t.rating)].map((_, k) => (
          <Star key={k} size={14} fill="#C9942A" style={{ color: "#C9942A" }} />
        ))}
      </div>
      {/* Quote */}
      <p
        style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: "1.1rem",
          fontStyle: "italic",
          color: C.navy,
          lineHeight: 1.65,
          flex: 1,
        }}
      >
        "{t.quote}"
      </p>
      {/* Author */}
      <div className="flex items-center gap-3 mt-5 pt-4" style={{ borderTop: "1px solid rgba(232,223,200,0.7)" }}>
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #0A1628, #1A3060)", border: "2px solid rgba(201,148,42,0.35)" }}
        >
          {t.avatar}
        </div>
        <div>
          <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.875rem", fontWeight: 700, color: C.navy }}>
            {t.name}
          </p>
          <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.75rem", color: C.textMuted }}>
            {t.role}
          </p>
        </div>
      </div>
    </div>
  );
};

/* ─ Section Header ───────────────────────────────────────────────────────── */
const SectionHeader = ({ label, title, subtitle, center = false }) => {
  const ref = useRef(null);
  const vis = useInView(ref);
  return (
    <div
      ref={ref}
      className={`mb-12 ${center ? "text-center" : ""}`}
      style={{
        transition: "opacity 0.7s ease, transform 0.7s ease",
        opacity: vis ? 1 : 0,
        transform: vis ? "translateY(0)" : "translateY(20px)",
      }}
    >
      <span className="section-label block mb-3">{label}</span>
      <h2
        style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: "clamp(1.8rem, 4vw, 3rem)",
          fontWeight: 700,
          color: C.navy,
          letterSpacing: "-0.02em",
          lineHeight: 1.15,
        }}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          style={{
            fontFamily: "'Jost', sans-serif",
            fontSize: "0.95rem",
            color: C.textMuted,
            marginTop: "10px",
            lineHeight: 1.7,
            maxWidth: center ? "52ch" : undefined,
            margin: center ? "12px auto 0" : "12px 0 0",
          }}
        >
          {subtitle}
        </p>
      )}
      <div className={`gold-divider mt-5 ${center ? "mx-auto" : ""}`} />
    </div>
  );
};

/* ─ Main Home ────────────────────────────────────────────────────────────── */
const Home = () => {
  const { isAuthenticated, user }        = useAuth();
  const [properties, setProperties]      = useState([]);
  const [loadingProps, setLoadingProps]  = useState(true);
  const [currentPage, setCurrentPage]    = useState(1);
  const [totalPages, setTotalPages]      = useState(1);

  useEffect(() => {
    const fetchProps = async () => {
      setLoadingProps(true);
      try {
        const { data } = await axios.get(`/api/properties/public?page=${currentPage}&limit=6`);
        setProperties(data.properties || []);
        setTotalPages(data.totalPages || 1);
      } catch (err) {
        console.error("Failed to load properties:", err);
      } finally {
        setLoadingProps(false);
      }
    };
    fetchProps();
  }, [currentPage]);

  return (
    <div className="min-h-screen" style={{ background: C.ivory, fontFamily: "'Jost', sans-serif" }}>

      {/* ══ 1. HERO ══════════════════════════════════════════════════════════ */}
      <HeroSection />

      {/* ══ 2. WELCOME STRIP (logged-in) ═════════════════════════════════════ */}
      {isAuthenticated && (
        <div
          className="animate-fade-in"
          style={{
            background: "linear-gradient(90deg, rgba(201,148,42,0.06) 0%, rgba(250,247,240,1) 50%, rgba(201,148,42,0.06) 100%)",
            borderBottom: "1px solid rgba(201,148,42,0.18)",
            padding: "12px 16px",
            textAlign: "center",
          }}
        >
          <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.875rem", color: C.navy }}>
            👋 Welcome back,{" "}
            <strong style={{ color: C.gold }}>{user?.name}</strong>! Your premium portfolio awaits below.
          </p>
        </div>
      )}

      {/* ══ 3. STATS BAND ════════════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #040810 0%, #0A1628 40%, #0D1830 70%, #040810 100%)",
        }}
      >
        {/* Decorative blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            style={{
              position: "absolute", top: "-30%", left: "-5%",
              width: "40%", height: "160%",
              background: "radial-gradient(ellipse, rgba(26,48,96,0.4) 0%, transparent 70%)",
              filter: "blur(50px)",
            }}
          />
          <div
            style={{
              position: "absolute", bottom: "-30%", right: "-5%",
              width: "40%", height: "160%",
              background: "radial-gradient(ellipse, rgba(201,148,42,0.12) 0%, transparent 70%)",
              filter: "blur(50px)",
            }}
          />
        </div>

        {/* Gold top rule */}
        <div
          style={{
            height: "1px",
            background: "linear-gradient(90deg, transparent 0%, rgba(201,148,42,0.6) 30%, rgba(232,184,75,0.9) 50%, rgba(201,148,42,0.6) 70%, transparent 100%)",
          }}
        />

        <div className="section-wrap py-4">
          <div
            className="grid grid-cols-2 md:grid-cols-4"
            style={{ borderLeft: "1px solid rgba(255,255,255,0.07)" }}
          >
            {STATS.map((s, i) => (
              <StatCard key={s.label} stat={s} delay={i * 100} />
            ))}
          </div>
        </div>

        {/* Gold bottom rule */}
        <div
          style={{
            height: "1px",
            background: "linear-gradient(90deg, transparent 0%, rgba(201,148,42,0.6) 30%, rgba(232,184,75,0.9) 50%, rgba(201,148,42,0.6) 70%, transparent 100%)",
          }}
        />
      </section>

      {/* ══ 4. PROPERTIES SECTION ════════════════════════════════════════════ */}
      <section className="py-16 sm:py-24" style={{ background: C.ivory }}>
        <div className="section-wrap">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
            <SectionHeader
              label="Our Portfolio"
              title="Available Properties"
              subtitle="Handpicked, verified, and ready for you."
            />
            <Link
              to="/properties"
              className="flex items-center gap-2 flex-shrink-0 transition-all duration-200 group"
              style={{
                fontFamily: "'Jost', sans-serif",
                fontSize: "0.875rem",
                fontWeight: 600,
                color: C.gold,
                paddingBottom: "60px",
                textDecoration: "none",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "#E8B84B"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = C.gold; }}
            >
              View All
              <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
          </div>

          <PropertyGrid properties={properties} loading={loadingProps} />

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => {
              setCurrentPage(page);
              window.scrollTo({ top: 500, behavior: "smooth" });
            }}
          />
        </div>
      </section>

      {/* ══ 5. WHY CHOOSE US ═════════════════════════════════════════════════ */}
      <section
        className="py-16 sm:py-24"
        style={{ background: C.ivoryWarm, borderTop: `1px solid ${C.ivoryDeep}`, borderBottom: `1px solid ${C.ivoryDeep}` }}
      >
        <div className="section-wrap">
          <SectionHeader
            label="Our Promise"
            title="Why Nirapod Nibash?"
            subtitle="Bangladesh's most trusted real estate platform — we do things differently."
            center
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            {FEATURES.map((f, i) => <FeatureCard key={f.title} f={f} i={i} />)}
          </div>
        </div>
      </section>

      {/* ══ 6. TESTIMONIALS ══════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-24" style={{ background: C.ivory }}>
        <div className="section-wrap">
          <SectionHeader
            label="Client Stories"
            title="What Our Families Say"
            subtitle="Real stories from real homeowners — the trust we've built, one family at a time."
            center
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
            {TESTIMONIALS.map((t, i) => <TestimonialCard key={t.name} t={t} i={i} />)}
          </div>
        </div>
      </section>

      {/* ══ 7. CTA BAND (guests only) ═════════════════════════════════════════ */}
      {!isAuthenticated && (
        <section
          className="relative overflow-hidden py-20 sm:py-28"
          style={{
            background: "linear-gradient(150deg, #040810 0%, #0A1628 30%, #122040 60%, #8B600A 85%, #C9942A 100%)",
          }}
        >
          {/* Orb decorations */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div
              style={{
                position: "absolute", top: "-20%", left: "-10%",
                width: "50%", height: "100%",
                background: "radial-gradient(ellipse, rgba(26,48,96,0.5) 0%, transparent 70%)",
                filter: "blur(60px)",
              }}
            />
            <div
              style={{
                position: "absolute", bottom: "-20%", right: "-10%",
                width: "45%", height: "80%",
                background: "radial-gradient(ellipse, rgba(201,148,42,0.25) 0%, transparent 70%)",
                filter: "blur(50px)",
              }}
            />
          </div>

          {/* Grid */}
          <div
            className="absolute inset-0 pointer-events-none opacity-10"
            style={{
              backgroundImage: `linear-gradient(rgba(201,148,42,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(201,148,42,0.15) 1px, transparent 1px)`,
              backgroundSize: "72px 72px",
            }}
          />

          <div
            className="relative z-10 text-center section-wrap"
            style={{ maxWidth: "800px" }}
          >
            <div className="premium-badge mx-auto mb-5" style={{ width: "fit-content" }}>
              Start Your Journey
            </div>

            <h2
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: "clamp(2rem, 5vw, 3.75rem)",
                fontWeight: 700,
                color: "#FFFFFF",
                letterSpacing: "-0.02em",
                lineHeight: 1.1,
                marginBottom: "1.25rem",
              }}
            >
              Find Your Perfect{" "}
              <em
                style={{
                  fontStyle: "italic",
                  background: "linear-gradient(135deg, #C9942A, #E8B84B, #F5D98C)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Home
              </em>
              <br />in Bangladesh
            </h2>

            <p
              style={{
                fontFamily: "'Jost', sans-serif",
                fontSize: "clamp(0.9rem, 2vw, 1.05rem)",
                color: "rgba(200,211,232,0.75)",
                maxWidth: "50ch",
                margin: "0 auto 2.5rem",
                lineHeight: 1.75,
              }}
            >
              Join 850+ happy families who found their dream apartment through
              Bangladesh's most trusted real-estate platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/register" className="btn-gold w-full sm:w-auto" style={{ padding: "0.9rem 2.5rem", fontSize: "0.95rem" }}>
                Create Free Account <ArrowRight size={18} />
              </Link>
              <Link to="/properties" className="btn-outline-gold w-full sm:w-auto" style={{ padding: "0.9rem 2.5rem", fontSize: "0.95rem" }}>
                Browse Properties
              </Link>
            </div>

            {/* Trust badges */}
            <div
              className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-10"
              style={{ color: "rgba(200,211,232,0.65)", fontFamily: "'Jost', sans-serif", fontSize: "0.8rem", fontWeight: 500 }}
            >
              {["100% Verified Listings", "No Hidden Fees", "Legal Assistance Included"].map((badge) => (
                <div key={badge} className="flex items-center gap-2">
                  <CheckCircle size={14} style={{ color: C.goldLight, flexShrink: 0 }} />
                  {badge}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══ 8. CONTACT STRIP ════════════════════════════════════════════════ */}
      <section
        className="py-10 sm:py-12"
        style={{
          background: C.ivoryWarm,
          borderTop: `1px solid ${C.ivoryDeep}`,
          borderBottom: `1px solid ${C.ivoryDeep}`,
        }}
      >
        <div className="section-wrap">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 text-center sm:text-left">

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #040810, #0A1628)", boxShadow: "0 4px 12px rgba(4,8,16,0.2)" }}
              >
                <Phone size={18} style={{ color: C.gold }} />
              </div>
              <div>
                <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: C.gold, marginBottom: "3px" }}>
                  Call Us
                </p>
                <a href="tel:+8801700000000" style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.9rem", fontWeight: 600, color: C.navy, textDecoration: "none" }}>
                  +880 1700-000000
                </a>
                <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.75rem", color: C.textMuted, marginTop: "2px" }}>Sat–Thu · 9 AM–7 PM</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #040810, #0A1628)", boxShadow: "0 4px 12px rgba(4,8,16,0.2)" }}
              >
                <Mail size={18} style={{ color: C.gold }} />
              </div>
              <div>
                <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: C.gold, marginBottom: "3px" }}>
                  Email
                </p>
                <a href="mailto:info@nirapodnibash.com" style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.9rem", fontWeight: 600, color: C.navy, textDecoration: "none" }}>
                  info@nirapodnibash.com
                </a>
                <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.75rem", color: C.textMuted, marginTop: "2px" }}>We reply within 24 hours</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #040810, #0A1628)", boxShadow: "0 4px 12px rgba(4,8,16,0.2)" }}
              >
                <MapPin size={18} style={{ color: C.gold }} />
              </div>
              <div>
                <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: C.gold, marginBottom: "3px" }}>
                  Visit Us
                </p>
                <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.9rem", fontWeight: 600, color: C.navy }}>123 Gulshan Ave, Dhaka</p>
                <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.75rem", color: C.textMuted, marginTop: "2px" }}>Dhaka 1212, Bangladesh</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ══ 9. FOOTER ════════════════════════════════════════════════════════ */}
      <footer style={{ background: "#040810", color: "rgba(200,211,232,0.7)" }}>
        {/* Gold accent */}
        <div
          style={{
            height: "1px",
            background: "linear-gradient(90deg, transparent 0%, rgba(201,148,42,0.5) 30%, rgba(232,184,75,0.8) 50%, rgba(201,148,42,0.5) 70%, transparent 100%)",
          }}
        />

        <div className="section-wrap py-14">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">

            {/* Brand */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-5">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, #0A1628, #1A3060)",
                    border: "1px solid rgba(201,148,42,0.25)",
                    boxShadow: "0 4px 12px rgba(201,148,42,0.15)",
                  }}
                >
                  <Building2 size={20} style={{ color: C.gold }} />
                </div>
                <div>
                  <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "1.15rem", fontWeight: 700, color: "#FFFFFF" }}>
                    Nirapod Nibash
                  </p>
                  <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "9px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: C.gold, marginTop: "1px" }}>
                    Premium Real Estate
                  </p>
                </div>
              </div>
              <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.875rem", color: "rgba(200,211,232,0.55)", lineHeight: 1.75, maxWidth: "30ch" }}>
                Bangladesh's trusted gateway to premium residential properties. Live the life you deserve.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: C.gold, marginBottom: "16px" }}>
                Quick Links
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
                {[["Home", "/"], ["Properties", "/properties"], ["About Us", "/about"], ["Contact", "/contact"]].map(([label, to]) => (
                  <li key={label}>
                    <Link
                      to={to}
                      className="flex items-center gap-2 group transition-colors duration-200"
                      style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.875rem", color: "rgba(200,211,232,0.55)", textDecoration: "none" }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = C.goldLight; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(200,211,232,0.55)"; }}
                    >
                      <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "rgba(201,148,42,0.5)", flexShrink: 0, display: "inline-block" }} />
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: C.gold, marginBottom: "16px" }}>
                Contact
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
                {[
                  { icon: "📍", text: "123 Gulshan Ave, Dhaka" },
                  { icon: "📞", text: "+880 1700-000000", href: "tel:+8801700000000" },
                  { icon: "✉️", text: "info@nirapodnibash.com", href: "mailto:info@nirapodnibash.com" },
                  { icon: "🕐", text: "Sat–Thu: 9 AM – 7 PM" },
                ].map(({ icon, text, href }) => (
                  <li key={text}>
                    {href ? (
                      <a
                        href={href}
                        className="transition-colors duration-200"
                        style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.875rem", color: "rgba(200,211,232,0.55)", textDecoration: "none" }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = C.goldLight; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(200,211,232,0.55)"; }}
                      >
                        {icon} {text}
                      </a>
                    ) : (
                      <span style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.875rem", color: "rgba(200,211,232,0.55)" }}>
                        {icon} {text}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Bottom bar */}
          <div
            className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-3"
            style={{
              borderTop: "1px solid rgba(255,255,255,0.06)",
              fontFamily: "'Jost', sans-serif",
              fontSize: "0.75rem",
              color: "rgba(200,211,232,0.35)",
            }}
          >
            <p>© 2026 Nirapod Nibash. All rights reserved.</p>
            <p>Built with ❤️ for Bangladesh's Real Estate Market</p>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Home;
