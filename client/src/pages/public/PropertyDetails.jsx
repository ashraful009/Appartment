import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import {
  MapPin, Building2, Layers, LayoutGrid, Clock, Car, Home,
  ChevronLeft, ImageOff, CheckCircle, AlertCircle, Loader2, User, Mail, Phone,
  FileText,
} from "lucide-react";
import { useLoadScript, GoogleMap, Marker } from "@react-google-maps/api";
import PropertyUnitsTab from "../../components/public/PropertyUnitsTab";

const MAPS_LIBRARIES = ["places"];
const MAP_CONTAINER_STYLE = { width: "100%", height: "380px" };
const MAP_OPTIONS = {
  mapTypeControl: false, streetViewControl: false,
  fullscreenControl: false, zoomControl: false,
  scrollwheel: false, gestureHandling: "none",
};

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
  const { user, isAuthenticated } = useAuth();

  const [property, setProperty] = useState(null);
  const [propertyUnits, setPropertyUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lightbox, setLightbox] = useState(null);
  const [requesting, setRequesting] = useState(false);
  const [requested, setRequested] = useState(false);
  const [toast, setToast] = useState(null);

  const { isLoaded: mapsLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
    libraries: MAPS_LIBRARIES,
  });

  // ── Guest form state ──────────────────────────────────────────────────────
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [guestSubmitting, setGuestSubmitting] = useState(false);
  const [guestData, setGuestData] = useState({ name: "", email: "", phone: "" });

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    const fetchPropertyData = async () => {
      try {
        const [propRes, unitsRes] = await Promise.all([
          axios.get(`/api/properties/${id}`),
          axios.get(`/api/properties/${id}/units`).catch(() => ({ data: { units: [] } }))
        ]);
        setProperty(propRes.data.property);
        setPropertyUnits(unitsRes.data.units || []);
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
    fetchPropertyData();
  }, [id]);

  // ── "Contact for Pricing" handler ─────────────────────────────────────────
  const handleRequestPrice = async () => {
    if (requested || requesting) return;

    if (!isAuthenticated) {
      // Guest flow: reveal the inline form instead of redirecting
      setShowGuestForm(true);
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

  // ── Guest form submit ─────────────────────────────────────────────────────
  const handleGuestSubmit = async (e) => {
    e.preventDefault();
    const { name, email, phone } = guestData;
    if (!name.trim() || !email.trim() || !phone.trim()) {
      showToast("error", "Please fill in all fields.");
      return;
    }

    setGuestSubmitting(true);
    try {
      await axios.post("/api/requests", { propertyId: id, name: name.trim(), email: email.trim(), phone: phone.trim() });
      setRequested(true);
      setShowGuestForm(false);
      showToast("success", "Request submitted successfully! Our agent will contact you soon.");
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to submit request. Please try again.";
      showToast("error", msg);
    } finally {
      setGuestSubmitting(false);
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

  const {
    name, address, mainImage, extraImages = [],
    totalUnits, floors, landSize, handoverTime, parkingArea,
    apartmentSizes = [], description, mapLocation,
  } = property;

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

        {/* ── Building Description ──────────────────────────────── */}
        {description && (
          <section className="mb-8 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <FileText size={16} className="text-brand-600" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400">About This Building</h2>
            </div>
            <p className="text-gray-700 leading-relaxed text-[15px]">{description}</p>
          </section>
        )}

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
                  <p className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-3">
                    <Building2 size={15} className="text-gray-400" /> Available Apartments
                  </p>
                  <div className="space-y-2">
                    {apartmentSizes.map((s, i) => (
                      <div key={i} className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-bold text-gray-800 text-sm">{s.type}</span>
                          <span className="text-gray-300 text-xs">|</span>
                          <span className="text-brand-600 font-semibold text-sm">{s.size}</span>
                        </div>
                        {s.description && (
                          <p className="text-xs text-gray-500 leading-relaxed mt-0.5">{s.description}</p>
                        )}
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
                  : showGuestForm
                    ? "bg-gray-800 cursor-default"
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

            {/* ── Inline Guest Form ─────────────────────────────────── */}
            {showGuestForm && !requested && (
              <form
                onSubmit={handleGuestSubmit}
                className="mt-4 border border-gray-200 rounded-xl p-5 bg-gray-50 space-y-3 animate-[fadeInDown_0.25s_ease]"
              >
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Your Details</p>

                {/* Full Name */}
                <div className="relative">
                  <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={guestData.name}
                    onChange={e => setGuestData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white placeholder-gray-400"
                    required
                    disabled={guestSubmitting}
                  />
                </div>

                {/* Email Address */}
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={guestData.email}
                    onChange={e => setGuestData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white placeholder-gray-400"
                    required
                    disabled={guestSubmitting}
                  />
                </div>

                {/* Phone Number */}
                <div className="relative">
                  <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={guestData.phone}
                    onChange={e => setGuestData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white placeholder-gray-400"
                    required
                    disabled={guestSubmitting}
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-1">
                  <button
                    type="submit"
                    disabled={guestSubmitting}
                    className="flex-1 py-2.5 rounded-lg bg-gray-900 hover:bg-black text-white text-sm font-bold uppercase tracking-widest transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {guestSubmitting
                      ? <><Loader2 size={14} className="animate-spin" /> Submitting…</>
                      : "Submit Request"
                    }
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowGuestForm(false)}
                    disabled={guestSubmitting}
                    className="px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>

                <p className="text-xs text-gray-400 text-center pt-1">
                  We'll never share your details without your consent.
                </p>
              </form>
            )}
          </div>
        </div>

        {/* ── Unit Visualizer ────────────────────────────────────── */}
        {(totalUnits > 0 && floors > 0) && (
          <section className="mt-14">
            <PropertyUnitsTab property={property} units={propertyUnits} />
          </section>
        )}

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

        {/* ── Satellite Map ──────────────────────────────────────── */}
        {mapLocation?.lat && mapLocation?.lng && (
          <section className="mt-14">
            <div className="mb-5 pb-3 border-b border-gray-200">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-gray-400 mb-0.5">Find Us</p>
              <h2 className="text-xl font-extrabold text-gray-900">Building Location</h2>
            </div>
            <div className="rounded-2xl overflow-hidden shadow-md border border-gray-100">
              {mapsLoaded ? (
                <GoogleMap
                  mapContainerStyle={MAP_CONTAINER_STYLE}
                  center={{ lat: mapLocation.lat, lng: mapLocation.lng }}
                  zoom={17}
                  mapTypeId="satellite"
                  options={MAP_OPTIONS}
                >
                  <Marker position={{ lat: mapLocation.lat, lng: mapLocation.lng }} />
                </GoogleMap>
              ) : (
                <div className="h-[380px] bg-gray-100 flex items-center justify-center text-gray-400 text-sm gap-2">
                  <Loader2 size={18} className="animate-spin" />
                  Loading map…
                </div>
              )}
            </div>
            <p className="mt-2 text-xs text-gray-400 flex items-center gap-1">
              <MapPin size={11} />
              {address}
            </p>
          </section>
        )}
      </div>
    </>
  );
};

export default PropertyDetails;
