import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { ArrowRight } from "lucide-react";
import HeroBanner   from "../../components/common/HeroBanner";
import PropertyGrid from "../../components/common/PropertyGrid";
import Pagination   from "../../components/common/Pagination";

const stats = [
  { label: "Properties Listed", value: "1,200+" },
  { label: "Happy Clients",     value: "850+"   },
  { label: "Cities Covered",    value: "30+"    },
  { label: "Years Experience",  value: "10+"    },
];


const Home = () => {
  const { isAuthenticated, user } = useAuth();

  const [banner,     setBanner]     = useState(null);
  const [properties, setProperties] = useState([]);
  const [loadingBanner,    setLoadingBanner]    = useState(true);
  const [loadingPropsData, setLoadingPropsData] = useState(true);
  const [bannerError,      setBannerError]      = useState(false);
  const [currentPage,  setCurrentPage]  = useState(1);
  const [totalPages,   setTotalPages]   = useState(1);

  // Fetch active banner
  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const { data } = await axios.get("/api/banners/active");
        setBanner(data.banner);
      } catch {
        // 404 = no banner yet — HeroBanner shows gradient fallback
        setBannerError(true);
      } finally {
        setLoadingBanner(false);
      }
    };
    fetchBanner();
  }, []);

  // Fetch paginated properties
  useEffect(() => {
    const fetchProperties = async () => {
      setLoadingPropsData(true);
      try {
        const { data } = await axios.get(
          `/api/properties/public?page=${currentPage}&limit=6`
        );
        setProperties(data.properties || []);
        setTotalPages(data.totalPages   || 1);
      } catch (err) {
        console.error("Failed to load properties:", err);
      } finally {
        setLoadingPropsData(false);
      }
    };
    fetchProperties();
  }, [currentPage]);

  return (
    <div className="min-h-screen">

      {/* ── Hero Carousel Banner ──────────────────────────────────────── */}
      {loadingBanner ? (
        <div className="h-[520px] sm:h-[620px] bg-gray-200 animate-pulse" />
      ) : (
        <HeroBanner banner={bannerError ? null : banner} />
      )}

      {/* ── Welcome chip (for logged-in users) ───────────────────────── */}
      {isAuthenticated && (
        <div className="bg-brand-50 border-b border-brand-100 px-6 py-3 text-center">
          <p className="text-sm text-brand-700 font-medium">
            👋 Welcome back, <strong>{user?.name}</strong>! Explore our latest listings below.
          </p>
        </div>
      )}

      {/* ── Stats Bar ────────────────────────────────────────────────── */}
      <section className="bg-white border-b border-gray-100 py-10">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {stats.map((s) => (
            <div key={s.label} className="p-4">
              <p className="text-3xl font-extrabold text-brand-700">{s.value}</p>
              <p className="text-sm text-gray-500 mt-1 font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Property Listings ─────────────────────────────────────── */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Section header */}
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Available Properties</h2>
            <p className="text-gray-500 mt-2 text-sm">Browse our hand-picked listings across Bangladesh.</p>
          </div>

          {/* Full-width property grid */}
          <PropertyGrid properties={properties} loading={loadingPropsData} />

          {/* ── Pagination ──────────────────────────────────────────── */}
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


      {/* ── CTA ──────────────────────────────────────────────────────── */}
      {!isAuthenticated && (
        <section className="py-20 px-6 bg-gradient-to-r from-brand-600 to-brand-800 text-white text-center">
          <h2 className="text-3xl font-extrabold mb-4">Ready to Get Started?</h2>
          <p className="text-brand-100 mb-8 max-w-md mx-auto">Create a free account to list properties, save favorites, and connect with sellers.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register"
              className="bg-white text-brand-700 font-bold px-8 py-3.5 rounded-xl hover:bg-brand-50 transition-colors flex items-center justify-center gap-2 shadow-lg">
              Get Started <ArrowRight size={18} />
            </Link>
            <Link to="/login"
              className="border-2 border-white text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-white/10 transition-colors">
              Login
            </Link>
          </div>
        </section>
      )}

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer className="bg-gray-900 text-gray-400 py-8 text-center text-sm">
        <p>© 2026 Apartment. All rights reserved.</p>
        <p className="mt-1 text-gray-500">Built with ❤️ for Bangladesh&apos;s Real Estate Market.</p>
      </footer>
    </div>
  );
};

export default Home;
