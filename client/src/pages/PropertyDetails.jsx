import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import {
  MapPin, Building2, Layers, LayoutGrid, Clock, Car, Home,
  ChevronLeft, ImageOff, CheckCircle, AlertCircle, Loader2,
} from "lucide-react";

// ── Toast ─────────────────────────────────────────────────────────────────────
const Toast = ({ toast, onClose }) => {
  if (!toast) return null;
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-start gap-3 px-5 py-4 rounded-2xl shadow-xl text-sm font-medium max-w-sm ${
      toast.type === "success"
        ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
        : "bg-red-50 border border-red-200 text-red-700"
    }`}>
      {toast.type === "success"
        ? <CheckCircle size={18} className="flex-shrink-0 mt-0.5" />
        : <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />}
      <span className="flex-1">{toast.msg}</span>
      <button onClick={onClose} className="text-current opacity-60 hover:opacity-100">✕</button>
    </div>
  );
};

// ── Skeleton ──────────────────────────────────────────────────────────────────
const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`} />
);

// ── Detail row ────────────────────────────────────────────────────────────────
const DetailRow = ({ icon: Icon, label, value }) => {
  if (!value && value !== 0) return null;
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0 gap-4">
      <span className="flex items-center gap-2 text-sm font-medium text-gray-500 whitespace-nowrap">
        <Icon size={15} className="text-gray-400 flex-shrink-0" />
        {label}
      </span>
      <span className="text-sm font-semibold text-gray-800 text-right">{value}</span>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [property, setProperty]   = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [lightbox, setLightbox]   = useState(null);
  const [requesting, setRequesting] = useState(false);
  const [requested, setRequested] = useState(false);
  const [toast, setToast]         = useState(null);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const { data } = await axios.get(`/api/properties/${id}`);
        setProperty(data.property);
      } catch (err) {
        setError(
          err?.response?.status === 404
            ? "Property not found."
            : "Failed to load property. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  // ── "Contact for Pricing" handler ─────────────────────────────────────────
  const handleRequestPrice = async () => {
    if (requested || requesting) return;

    if (!isAuthenticated) {
      // Save intent and redirect to login
      sessionStorage.setItem("pendingRequest", id);
      navigate("/login");
      return;
    }

    setRequesting(true);
    try {
      await axios.post("/api/requests", { propertyId: id });
      setRequested(true);
      showToast("success", "Request sent! A seller will contact you shortly.");
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to send request. Please try again.";
      showToast("error", msg);
    } finally {
      setRequesting(false);
    }
  };

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6 mt-8">
        <Skeleton className="h-8 w-40 mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Skeleton className="h-[480px]" />
          <div className="space-y-3">
            <Skeleton className="h-6 w-32 mb-5" />
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-10" />)}
            <Skeleton className="h-12 mt-6" />
          </div>
        </div>
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6 mt-16 flex flex-col items-center gap-4 text-center">
        <ImageOff size={56} className="text-gray-300" />
        <p className="text-xl font-semibold text-gray-600">{error}</p>
        <button onClick={() => navigate(-1)} className="mt-2 flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-800 transition-colors">
          <ChevronLeft size={16} /> Go Back
        </button>
      </div>
    );
  }

  const { name, address, mainImage, extraImages = [], totalUnits, floors, landSize, handoverTime, parkingArea, apartmentSizes = [] } = property;

  return (
    <>
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="Gallery preview" className="max-w-full max-h-full rounded-lg shadow-2xl object-contain" />
          <button onClick={() => setLightbox(null)} className="absolute top-4 right-4 text-white/70 hover:text-white text-3xl font-light leading-none" aria-label="Close">×</button>
        </div>
      )}

      <div className="max-w-7xl mx-auto p-6 mt-8">
        <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-brand-600 transition-colors">
          <ChevronLeft size={16} /> Back to listings
        </button>

        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-gray-900 leading-tight">{name}</h1>
          <p className="flex items-center gap-1.5 text-gray-500 mt-1.5 text-sm">
            <MapPin size={14} className="text-brand-500 flex-shrink-0" />
            {address}
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* Left — Image */}
          <div className="h-full min-h-[400px]">
            {mainImage ? (
              <img src={mainImage} alt={name} className="w-full h-full object-cover rounded-xl shadow-md" />
            ) : (
              <div className="w-full h-full min-h-[400px] bg-gradient-to-br from-brand-600 to-brand-900 rounded-xl shadow-md flex items-center justify-center">
                <Building2 size={80} className="text-white/30" />
              </div>
            )}
          </div>

          {/* Right — Info + CTA */}
          <div className="flex flex-col">
            <div className="pb-3 border-b-2 border-gray-900 mb-1">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-gray-400 mb-0.5">Property Overview</p>
              <h2 className="text-lg font-extrabold text-gray-900 uppercase tracking-wide">At A Glance</h2>
            </div>

            <div className="flex-1">
              <DetailRow icon={MapPin}     label="Address"       value={address} />
              <DetailRow icon={Home}       label="Total Units"   value={totalUnits > 0 ? `${totalUnits} units` : null} />
              <DetailRow icon={Layers}     label="Floors"        value={floors > 0 ? `${floors} floors` : null} />
              <DetailRow icon={LayoutGrid} label="Land Size"     value={landSize || null} />
              <DetailRow icon={Clock}      label="Handover Time" value={handoverTime || null} />
              <DetailRow icon={Car}        label="Parking Area"  value={parkingArea || null} />

              {apartmentSizes.length > 0 && (
                <div className="py-3 border-b border-gray-200">
                  <p className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-2">
                    <Building2 size={15} className="text-gray-400" /> Apartment Sizes
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {apartmentSizes.map((s, i) => (
                      <div key={i} className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm">
                        <span className="font-semibold text-gray-700">{s.type}</span>
                        <span className="text-gray-300">|</span>
                        <span className="text-gray-600">{s.size}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* CTA Button */}
            <button
              onClick={handleRequestPrice}
              disabled={requesting || requested}
              className={`mt-6 w-full py-3.5 rounded-lg text-white text-sm font-bold uppercase tracking-widest transition-all duration-200 shadow-md flex items-center justify-center gap-2 ${
                requested
                  ? "bg-emerald-600 cursor-default"
                  : requesting
                    ? "bg-gray-700 cursor-not-allowed opacity-80"
                    : "bg-gray-900 hover:bg-black hover:shadow-xl"
              }`}
            >
              {requesting && <Loader2 size={16} className="animate-spin" />}
              {requested
                ? <><CheckCircle size={16} /> Request Sent!</>
                : requesting
                  ? "Sending…"
                  : "Contact for Pricing"
              }
            </button>
          </div>
        </div>

        {/* Gallery */}
        {extraImages.length > 0 && (
          <section className="mt-14">
            <div className="mb-5 pb-3 border-b border-gray-200">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-gray-400 mb-0.5">More Views</p>
              <h2 className="text-xl font-extrabold text-gray-900">Building Photo Gallery</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-2">
              {extraImages.map((url, i) => (
                <div key={i} className="overflow-hidden rounded-xl shadow-sm group cursor-pointer" onClick={() => setLightbox(url)}>
                  <img src={url} alt={`${name} — photo ${i + 1}`} className="h-48 w-full object-cover rounded-xl group-hover:opacity-80 group-hover:scale-105 transition-all duration-300" loading="lazy" />
                </div>
              ))}
            </div>
          </section>
        )}

        {extraImages.length === 0 && (
          <div className="mt-14 py-10 text-center text-gray-400 text-sm border border-dashed border-gray-200 rounded-xl">
            No additional photos available for this property.
          </div>
        )}
      </div>
    </>
  );
};

export default PropertyDetails;
