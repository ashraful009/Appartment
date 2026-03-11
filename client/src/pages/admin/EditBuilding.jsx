import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { ImagePlus, X, Plus, Trash2, CheckCircle, AlertCircle, Upload, Building2, Loader2 } from "lucide-react";

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
};

const EditBuilding = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm]               = useState(INITIAL_FORM);
  const [mainImage, setMainImage]     = useState(null); // new file upload
  const [mainPreview, setMainPreview] = useState(null); // url to show
  const [extraFiles, setExtraFiles]   = useState([]); // new files
  const [extraPreviews, setExtraPreviews] = useState([]); // urls to show
  const [aptSizes, setAptSizes]       = useState([{ type: "", size: "" }]);
  const [loading, setLoading]         = useState(false);
  const [fetching, setFetching]       = useState(true);
  const [toast, setToast]             = useState(null);

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
      });

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
  const addSizeRow    = () => setAptSizes((p) => [...p, { type: "", size: "" }]);
  const removeSizeRow = (idx) => setAptSizes((p) => p.filter((_, i) => i !== idx));
  const updateSize    = (idx, field, val) =>
    setAptSizes((p) => p.map((row, i) => (i === idx ? { ...row, [field]: val } : row)));

  // ── Submit ──────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.address) {
      showToast("error", "Property name and address are required.");
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      
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
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide flex items-center gap-2">
            <Building2 size={16} /> Images
          </h2>

          <div className="bg-amber-50 border border-amber-200 text-amber-700 text-xs rounded-xl p-3 mb-4">
             Note: Selecting new photos will overwrite the existing ones. Do not select files if you wish to keep the existing Main or Extra images.
          </div>

          {/* Main image */}
          <div>
             <label className="form-label">Main Building Image</label>
            <div className="flex items-start gap-4">
              <label
                htmlFor="mainImage"
                className="flex-shrink-0 w-36 h-24 rounded-xl border-2 border-dashed border-gray-200 hover:border-brand-400 flex items-center justify-center cursor-pointer transition-colors overflow-hidden"
              >
                {mainPreview ? (
                  <img src={mainPreview} alt="main" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center p-2">
                     <ImagePlus size={22} className="text-gray-400 mx-auto" />
                    <p className="text-xs text-gray-400 mt-1">Click to upload</p>
                  </div>
                )}
              </label>
              <input
                ref={mainInputRef}
                id="mainImage"
                type="file"
                accept="image/*"
                onChange={handleMainImage}
                className="hidden"
              />
              {mainPreview && mainImage && (
                <button
                   type="button"
                  onClick={() => { setMainImage(null); setMainPreview(null); if (mainInputRef.current) mainInputRef.current.value = ""; }}
                   className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 mt-1"
                >
                   <X size={13} /> Clear New File
                </button>
              )}
            </div>
          </div>

          {/* Extra images */}
          <div>
            <label className="form-label">Extra Images <span className="text-gray-400 font-normal">(up to 10)</span></label>
            <div className="grid grid-cols-5 gap-3">
              {extraPreviews.map((src, i) => (
                <div key={i} className="relative group rounded-xl overflow-hidden aspect-square bg-gray-100">
                  <img src={src} alt={`extra-${i}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeExtra(i)}
                    className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}
              {extraFiles.length < 10 && (
                <label
                   htmlFor="extraImages"
                  className="aspect-square rounded-xl border-2 border-dashed border-gray-200 hover:border-brand-400 flex items-center justify-center cursor-pointer transition-colors"
                >
                  <div className="text-center">
                    <Plus size={18} className="text-gray-400 mx-auto" />
                    <p className="text-xs text-gray-400 mt-0.5">Add</p>
                  </div>
                </label>
              )}
            </div>
            <input ref={extraInputRef} id="extraImages" type="file" accept="image/*" multiple onChange={handleExtraImages} className="hidden" />
            <p className="text-xs text-gray-400 mt-2">{extraFiles.length} / 10 new images selected</p>
          </div>
        </div>

        {/* ── Section: Details ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
           <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Building Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Property Name *</label>
               <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Gulshan Heights" className="input-field" required />
            </div>
            <div className="md:col-span-2">
               <label className="form-label">Detailed Address *</label>
               <input name="address" value={form.address} onChange={handleChange} placeholder="e.g. Road 12, Gulshan 2, Dhaka" className="input-field" required />
            </div>
            <div>
              <label className="form-label">Total Units</label>
              <input name="totalUnits" type="number" min="0" value={form.totalUnits} onChange={handleChange} placeholder="e.g. 48" className="input-field" />
            </div>
            <div>
              <label className="form-label">Number of Floors</label>
              <input name="floors" type="number" min="0" value={form.floors} onChange={handleChange} placeholder="e.g. 12" className="input-field" />
            </div>
            <div>
              <label className="form-label">Land Size</label>
              <input name="landSize" value={form.landSize} onChange={handleChange} placeholder="e.g. 10 katha" className="input-field" />
            </div>
            <div>
              <label className="form-label">Handover Time</label>
               <input name="handoverTime" value={form.handoverTime} onChange={handleChange} placeholder="e.g. December 2026" className="input-field" />
            </div>
             <div className="md:col-span-2">
               <label className="form-label">Parking Area</label>
              <input name="parkingArea" value={form.parkingArea} onChange={handleChange} placeholder="e.g. Basement level, 48 slots" className="input-field" />
             </div>
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

           <div className="space-y-3">
            {/* Header */}
            <div className="grid grid-cols-[1fr_1fr_32px] gap-3">
               <p className="text-xs font-semibold text-gray-500 px-1">Type</p>
               <p className="text-xs font-semibold text-gray-500 px-1">Size</p>
             </div>
             {aptSizes.map((row, i) => (
              <div key={i} className="grid grid-cols-[1fr_1fr_32px] gap-3 items-center">
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
    </div>
  );
};

export default EditBuilding;
