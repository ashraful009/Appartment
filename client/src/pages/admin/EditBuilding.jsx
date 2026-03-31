import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { ImagePlus, X, Plus, Trash2, CheckCircle, AlertCircle, Upload, Building2, Loader2, MapPin } from "lucide-react";
import { useLoadScript } from "@react-google-maps/api";
import MapPickerModal from "../../components/admin/MapPickerModal";


const MAPS_LIBRARIES = ["places"];

const Toast = ({ type, msg, onClose }) => (
  <div className={`fixed bottom-6 right-6 z-50 flex items-start gap-3 px-5 py-4 rounded-2xl shadow-xl text-sm font-medium max-w-sm ${
    type === "success" ? "bg-emerald-50 border border-emerald-200 text-emerald-800" : "bg-red-50 border border-red-200 text-red-700"
  }`}>
    {type === "success" ? <CheckCircle size={18} className="flex-shrink-0 mt-0.5" /> : <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />}
    <span className="flex-1">{msg}</span>
    <button onClick={onClose}><X size={14} /></button>
  </div>
);

const INITIAL_FORM = {
  name: "", address: "", totalUnits: "", floors: "",
  landSize: "", handoverTime: "", parkingArea: "",
  description: "", displayOrder: "",
};

const DEFAULT_MAP_LOCATION = { lat: 23.7942, lng: 90.4132 };

const EditBuilding = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm]               = useState(INITIAL_FORM);
  const [mainImage, setMainImage]     = useState(null); // new file upload
  const [mainPreview, setMainPreview] = useState(null); // url to show
  const [extraFiles, setExtraFiles]   = useState([]); // new files
  const [extraPreviews, setExtraPreviews] = useState([]); // urls to show
  const [aptSizes, setAptSizes]       = useState([{ type: "", size: "", description: "" }]);
  const [mapLocation, setMapLocation] = useState(DEFAULT_MAP_LOCATION);
  const [showMapModal, setShowMapModal] = useState(false);
  const [loading, setLoading]         = useState(false);
  const [fetching, setFetching]       = useState(true);
  const [toast, setToast]             = useState(null);

  const { isLoaded: mapsLoaded, loadError: mapsLoadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
    libraries: MAPS_LIBRARIES,
  });

  const mainInputRef  = useRef(null);
  const extraInputRef = useRef(null);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4500);
  };

  useEffect(() => {
    fetchPropertyData();
  }, [id]);

  const fetchPropertyData = async () => {
    try {
      const { data } = await axios.get(`/api/properties/${id}`);
      const prop = data.property;

      setForm({
        name: prop.name || "",
        address: prop.address || "",
        totalUnits: prop.totalUnits || "",
        floors: prop.floors || "",
        landSize: prop.landSize || "",
        handoverTime: prop.handoverTime || "",
        parkingArea: prop.parkingArea || "",
        description: prop.description || "",
        displayOrder: prop.displayOrder ?? "",
      });

      if (prop.mapLocation?.lat && prop.mapLocation?.lng) {
        setMapLocation({ lat: prop.mapLocation.lat, lng: prop.mapLocation.lng });
      }

      if (prop.mainImage) {
        setMainPreview(prop.mainImage);
      }

      if (prop.extraImages && prop.extraImages.length > 0) {
         // for edit form we only show preview strings for now since we replace the entire array if new ones are uploaded
         setExtraPreviews(prop.extraImages);
      }

      if (prop.apartmentSizes && prop.apartmentSizes.length > 0) {
        setAptSizes(prop.apartmentSizes);
      }
    } catch (error) {
      console.error("Error fetching property:", error);
      showToast("error", "Failed to load property details.");
    } finally {
      setFetching(false);
    }
  };


  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSerialChange = (e) => {
    const val = parseInt(e.target.value, 10);
    if (!val) { setForm((p) => ({ ...p, displayOrder: "" })); return; }
    setForm((p) => ({ ...p, displayOrder: val }));
  };

  // ── Main Image ──────────────────────────────────────────────────────────
  const handleMainImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMainImage(file);
    setMainPreview(URL.createObjectURL(file));
  };

  // ── Extra Images ────────────────────────────────────────────────────────
  const handleExtraImages = (e) => {
    const selected = Array.from(e.target.files);
    // Note: To keep things simple matching AddBuilding logic, selecting new files replaces the array
    const merged = [...extraFiles, ...selected].slice(0, 10);
    setExtraFiles(merged);
    setExtraPreviews(merged.map((f) => URL.createObjectURL(f)));
  };

  const removeExtra = (idx) => {
    setExtraFiles((p) => p.filter((_, i) => i !== idx));
    setExtraPreviews((p) => p.filter((_, i) => i !== idx));
  };

  // ── Apartment Sizes ─────────────────────────────────────────────────────
  const addSizeRow    = () => setAptSizes((p) => [...p, { type: "", size: "", description: "" }]);
  const removeSizeRow = (idx) => setAptSizes((p) => p.filter((_, i) => i !== idx));
  const updateSize    = (idx, field, val) =>
    setAptSizes((p) => p.map((row, i) => (i === idx ? { ...row, [field]: val } : row)));

  // ── Submit ──────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.address || !form.description) {
      showToast("error", "Property name, address, and description are required.");
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      fd.append("mapLocation", JSON.stringify(mapLocation));
      
      if (mainImage) fd.append("mainImage", mainImage);
      
      if (extraFiles.length > 0) {
         extraFiles.forEach((f) => fd.append("extraImages", f));
      }
      
      const filteredSizes = aptSizes.filter((r) => r.type.trim() || r.size.trim());
      fd.append("apartmentSizes", JSON.stringify(filteredSizes));

      await axios.put(`/api/admin/properties/${id}`, fd, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      showToast("success", "Property updated successfully!");
      
      // Give a tiny delay so the toast goes through before navigating
      setTimeout(() => navigate('/admin-panel/manage-buildings'), 1500);
      
    } catch (err) {
      showToast("error", err?.response?.data?.message || "Failed to edit building.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
     return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-gray-800 flex items-center gap-2">Edit Building</h1>
        <p className="text-gray-500 text-sm mt-1">Update property details and images.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* ── Section: Images ── */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">

          <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-2">
            Building Images
          </h2>

          <div className="bg-amber-50 border border-amber-200 text-amber-700 text-xs rounded-xl p-3 mb-6">
            Note: Selecting new photos will overwrite the existing ones. Do not select files if you wish to keep the existing Main or Extra images.
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

            {/* ── Left: image uploaders ── */}
            <div className="space-y-7">

              {/* Main Image */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 mb-3">Main Image</p>

                <label
                  htmlFor="mainImage"
                  className="group relative flex flex-col items-center justify-center w-full h-44 rounded-2xl border-2 border-dashed border-indigo-200 bg-gray-50 cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/40 transition-all overflow-hidden"
                >
                  {mainPreview ? (
                    <img src={mainPreview} alt="main" className="absolute inset-0 w-full h-full object-cover rounded-2xl" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-gray-400 group-hover:text-indigo-500 transition-colors">
                      <ImagePlus size={28} />
                      <p className="text-xs font-semibold">Click to upload main image</p>
                      <p className="text-[10px] text-gray-300">PNG, JPG, WEBP</p>
                    </div>
                  )}
                </label>
                <input ref={mainInputRef} id="mainImage" type="file" accept="image/*" onChange={handleMainImage} className="hidden" />

                {mainPreview && mainImage && (
                  <button
                    type="button"
                    onClick={() => { setMainImage(null); setMainPreview(null); if (mainInputRef.current) mainInputRef.current.value = ""; }}
                    className="mt-2.5 flex items-center gap-1.5 text-xs font-semibold text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <Trash2 size={12} /> Remove Image
                  </button>
                )}
              </div>

              {/* Gallery Images */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 mb-3">
                  Gallery Images <span className="text-gray-400 normal-case font-normal">(max 10)</span>
                </p>

                <div className="grid grid-cols-5 gap-2.5">
                  {extraPreviews.map((src, i) => (
                    <div key={i} className="relative group aspect-square rounded-xl overflow-hidden shadow-sm">
                      <img src={src} alt={`extra-${i}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeExtra(i)}
                        className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={14} className="text-white" />
                      </button>
                    </div>
                  ))}
                  {extraFiles.length < 10 && (
                    <label
                      htmlFor="extraImages"
                      className="aspect-square rounded-xl border-2 border-dashed border-indigo-200 bg-gray-50 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/40 transition-all"
                    >
                      <Plus size={16} className="text-indigo-400" />
                      <span className="text-[9px] text-indigo-400 font-bold mt-0.5">ADD</span>
                    </label>
                  )}
                </div>
                <input ref={extraInputRef} id="extraImages" type="file" accept="image/*" multiple onChange={handleExtraImages} className="hidden" />
                <p className="text-[10px] text-gray-400 mt-2">{extraFiles.length} / 10 new images selected</p>
              </div>

            </div>

            {/* ── Right: full-bleed live card preview ── */}
            <div className="flex flex-col gap-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-600">
                Live Card Preview
              </p>

              <div
                className="relative w-full rounded-2xl overflow-hidden shadow-lg bg-gray-900"
                style={{ aspectRatio: "3/4" }}
              >
                {/* Background image fills entire card */}
                {mainPreview ? (
                  <img
                    src={mainPreview}
                    alt="preview"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-indigo-900 flex items-center justify-center">
                    <Building2 size={56} className="text-white/20" />
                  </div>
                )}

                {/* Bottom gradient overlay */}
                <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/85 via-black/45 to-transparent pointer-events-none" />

                {/* Pill tags */}
                <div className="absolute bottom-[88px] left-5 right-5 flex flex-wrap gap-1.5 pointer-events-none">
                  {Number(form.floors) > 0 && (
                    <span className="bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full border border-white/20">
                      {form.floors} floors
                    </span>
                  )}
                  {Number(form.totalUnits) > 0 && (
                    <span className="bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full border border-white/20">
                      {form.totalUnits} units
                    </span>
                  )}
                  {form.handoverTime && (
                    <span className="bg-yellow-400/85 text-yellow-900 text-[10px] font-bold px-2.5 py-1 rounded-full">
                      📅 {form.handoverTime}
                    </span>
                  )}
                </div>

                {/* Building name */}
                <h3 className="absolute bottom-[58px] left-5 right-5 text-white font-extrabold text-lg leading-snug drop-shadow-lg line-clamp-2 pointer-events-none">
                  {form.name || <span className="text-white/40 italic font-medium text-base">Building Name</span>}
                </h3>

                {/* Address row */}
                <div className="absolute bottom-5 left-5 right-5 flex items-center gap-1.5 pointer-events-none">
                  <MapPin size={13} className="text-yellow-300 flex-shrink-0" />
                  <p className="text-white/75 text-xs font-medium line-clamp-1">
                    {form.address || <span className="text-white/30 italic">Building Address</span>}
                  </p>
                </div>

                {/* Ghost hint when empty */}
                {!mainPreview && !form.name && (
                  <div className="absolute top-5 inset-x-5 text-center pointer-events-none">
                    <p className="text-white/30 text-xs">Fill in details to see preview</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* ── Section: Details ── */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">

          <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-7">Building Details</h2>

          {/* Row 1 — Property Name */}
          <div>
            <label className="text-sm font-semibold text-gray-600 mb-1.5 block">
              Property Name <span className="text-red-400">*</span>
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Gulshan Heights"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition-all"
              required
            />
          </div>

          {/* Row 2 — Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">

            <div>
              <label className="text-sm font-semibold text-gray-600 mb-1.5 block">Total Units</label>
              <input
                name="totalUnits"
                type="number"
                min="0"
                value={form.totalUnits}
                onChange={handleChange}
                placeholder="e.g. 48"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-600 mb-1.5 block">Number of Floors</label>
              <input
                name="floors"
                type="number"
                min="0"
                value={form.floors}
                onChange={handleChange}
                placeholder="e.g. 12"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-600 mb-1.5 block">Handover Time</label>
              <input
                name="handoverTime"
                value={form.handoverTime}
                onChange={handleChange}
                placeholder="e.g. December 2026"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-600 mb-1.5 block">Land Size</label>
              <input
                name="landSize"
                value={form.landSize}
                onChange={handleChange}
                placeholder="e.g. 10 katha"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-600 mb-1.5 block">Parking Area</label>
              <input
                name="parkingArea"
                value={form.parkingArea}
                onChange={handleChange}
                placeholder="e.g. Basement, 48 slots"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-600 mb-1.5 block">Display Order</label>
              <select
                name="displayOrder"
                value={form.displayOrder}
                onChange={handleSerialChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition-all appearance-none cursor-pointer"
              >
                <option value="">— Choose a position —</option>
                {Array.from({ length: 100 }, (_, i) => i + 1).map(num => (
                  <option key={num} value={num}>Position {num}</option>
                ))}
              </select>
              <p className="text-[11px] text-gray-400 mt-1.5 leading-snug">
                Lower numbers appear first on the home page.
              </p>
            </div>

          </div>

          {/* Row 3 — Location */}
          <div className="mt-6">
            <label className="text-sm font-semibold text-gray-600 mb-1.5 block">
              Full Address <span className="text-red-400">*</span>
            </label>
            <div className="flex items-start gap-4">
              <input
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="e.g. Road 12, Gulshan 2, Dhaka"
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowMapModal(true)}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-colors whitespace-nowrap ${
                  mapLocation.lat !== DEFAULT_MAP_LOCATION.lat || mapLocation.lng !== DEFAULT_MAP_LOCATION.lng
                    ? "bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100"
                    : "bg-indigo-50 border-indigo-200 text-indigo-600 hover:bg-indigo-100"
                }`}
              >
                <MapPin size={15} />
                {mapLocation.lat !== DEFAULT_MAP_LOCATION.lat ? "Location Set ✓" : "Add Location"}
              </button>
            </div>
          </div>

          {/* Row 4 — Description */}
          <div className="mt-6">
            <label className="text-sm font-semibold text-gray-600 mb-1.5 block">
              Building Description <span className="text-red-400">*</span>
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe the building — location highlights, key features, lifestyle appeal, nearby landmarks..."
              rows={5}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition-all resize-none"
              required
            />
          </div>

        </div>

        {/* ── Section: Apartment Sizes ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
           <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Apartment Sizes</h2>
             <button
              type="button"
              onClick={addSizeRow}
              className="flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-800 transition-colors"
            >
              <Plus size={14} /> Add Row
            </button>
           </div>

           <div className="space-y-4">
            {/* Header */}
            <div className="grid grid-cols-[1fr_1fr_32px] gap-3 px-1">
               <p className="text-xs font-semibold text-gray-500">Type</p>
               <p className="text-xs font-semibold text-gray-500">Size</p>
             </div>
             {aptSizes.map((row, i) => (
              <div key={i} className="border border-gray-100 rounded-xl p-3 space-y-2 bg-gray-50">
                <div className="grid grid-cols-[1fr_1fr_32px] gap-3 items-center">
                   <input
                    value={row.type}
                     onChange={(e) => updateSize(i, "type", e.target.value)}
                    placeholder="e.g. Type A"
                     className="input-field text-sm py-2.5"
                  />
                   <input
                    value={row.size}
                    onChange={(e) => updateSize(i, "size", e.target.value)}
                    placeholder="e.g. 2448 sft"
                    className="input-field text-sm py-2.5"
                  />
                   <button
                    type="button"
                    onClick={() => removeSizeRow(i)}
                    disabled={aptSizes.length === 1}
                     className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 disabled:opacity-30 transition-colors"
                   >
                     <Trash2 size={15} />
                  </button>
                </div>
                <textarea
                  value={row.description || ""}
                  onChange={(e) => updateSize(i, "description", e.target.value)}
                  placeholder="Description (e.g. 3 bed, 2 bath, open kitchen...)"
                  rows={2}
                  className="input-field resize-none w-full text-sm"
                />
              </div>
            ))}
           </div>
        </div>

        {/* ── Submit ── */}
        <button
          type="submit"
          disabled={loading}
           className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 text-base disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
             <>
               <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Updating Building…
            </>
           ) : (
            <>
              <Upload size={18} />
               Save Changes
            </>
          )}
        </button>
      </form>

      {/* Google Maps Picker Modal */}
      <MapPickerModal
        isOpen={showMapModal}
        onClose={() => setShowMapModal(false)}
        mapLocation={mapLocation}
        onConfirm={(pos) => setMapLocation(pos)}
        isLoaded={mapsLoaded}
        loadError={mapsLoadError}
      />

    </div>
  );
};

export default EditBuilding;
