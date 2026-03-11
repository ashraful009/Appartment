import React, { useState, useRef } from "react";
import axios from "axios";
import {
  ImagePlus,
  X,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  Upload,
  Building2,
} from "lucide-react";

const Toast = ({ type, msg, onClose }) => (
  <div
    className={`fixed bottom-6 right-6 z-50 flex items-start gap-3 px-5 py-4 rounded-xl shadow-lg text-sm font-medium max-w-sm ${type === "success"
        ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
        : "bg-red-50 border border-red-200 text-red-700"
      }`}
  >
    {type === "success" ? (
      <CheckCircle size={18} />
    ) : (
      <AlertCircle size={18} />
    )}
    <span className="flex-1">{msg}</span>
    <button onClick={onClose}>
      <X size={14} />
    </button>
  </div>
);

const INITIAL_FORM = {
  name: "",
  address: "",
  totalUnits: "",
  floors: "",
  landSize: "",
  handoverTime: "",
  parkingArea: "",
};

const AddBuilding = () => {
  const [form, setForm] = useState(INITIAL_FORM);
  const [mainImage, setMainImage] = useState(null);
  const [mainPreview, setMainPreview] = useState(null);
  const [extraFiles, setExtraFiles] = useState([]);
  const [extraPreviews, setExtraPreviews] = useState([]);
  const [aptSizes, setAptSizes] = useState([{ type: "", size: "" }]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const mainInputRef = useRef(null);
  const extraInputRef = useRef(null);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4500);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleMainImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMainImage(file);
    setMainPreview(URL.createObjectURL(file));
  };

  const handleExtraImages = (e) => {
    const selected = Array.from(e.target.files);
    const merged = [...extraFiles, ...selected].slice(0, 10);
    setExtraFiles(merged);
    setExtraPreviews(merged.map((f) => URL.createObjectURL(f)));
  };

  const removeExtra = (idx) => {
    setExtraFiles((p) => p.filter((_, i) => i !== idx));
    setExtraPreviews((p) => p.filter((_, i) => i !== idx));
  };

  const addSizeRow = () =>
    setAptSizes((p) => [...p, { type: "", size: "" }]);

  const removeSizeRow = (idx) =>
    setAptSizes((p) => p.filter((_, i) => i !== idx));

  const updateSize = (idx, field, val) =>
    setAptSizes((p) =>
      p.map((row, i) => (i === idx ? { ...row, [field]: val } : row))
    );

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
      extraFiles.forEach((f) => fd.append("extraImages", f));

      const filteredSizes = aptSizes.filter(
        (r) => r.type.trim() || r.size.trim()
      );

      fd.append("apartmentSizes", JSON.stringify(filteredSizes));

      await axios.post("/api/admin/properties", fd, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      showToast(
        "success",
        "Building listed successfully! Images uploaded to Cloudinary."
      );

      setForm(INITIAL_FORM);
      setMainImage(null);
      setMainPreview(null);
      setExtraFiles([]);
      setExtraPreviews([]);
      setAptSizes([{ type: "", size: "" }]);

      if (mainInputRef.current) mainInputRef.current.value = "";
      if (extraInputRef.current) extraInputRef.current.value = "";
    } catch (err) {
      showToast(
        "error",
        err?.response?.data?.message || "Failed to add building."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-8 space-y-8">

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Building2 className="text-indigo-600" />
          Add New Building
        </h1>
        <p className="text-gray-500 text-sm mt-2">
          Create a new building listing with images, details, and apartment sizes.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">

        {/* Image Section */}
        <div className="bg-white border rounded-2xl p-6 shadow-sm space-y-6">

          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Building Images
          </h2>

          {/* Main Image */}
          <div>
            <label className="form-label">Main Image</label>

            <div className="flex items-start gap-4">

              <label
                htmlFor="mainImage"
                className="w-40 h-28 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center cursor-pointer overflow-hidden hover:border-indigo-400"
              >
                {mainPreview ? (
                  <img
                    src={mainPreview}
                    alt="preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImagePlus className="text-gray-400" />
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

              {mainPreview && (
                <button
                  type="button"
                  onClick={() => {
                    setMainImage(null);
                    setMainPreview(null);
                    if (mainInputRef.current)
                      mainInputRef.current.value = "";
                  }}
                  className="text-red-500 text-sm"
                >
                  Remove
                </button>
              )}
            </div>
          </div>

          {/* Extra Images */}
          <div>
            <label className="form-label">
              Extra Images (max 10)
            </label>

            <div className="grid grid-cols-5 gap-3">

              {extraPreviews.map((src, i) => (
                <div
                  key={i}
                  className="relative group aspect-square rounded-lg overflow-hidden"
                >
                  <img
                    src={src}
                    className="w-full h-full object-cover"
                  />

                  <button
                    type="button"
                    onClick={() => removeExtra(i)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100"
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}

              {extraFiles.length < 10 && (
                <label
                  htmlFor="extraImages"
                  className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-indigo-400"
                >
                  <Plus className="text-gray-400" />
                </label>
              )}
            </div>

            <input
              ref={extraInputRef}
              id="extraImages"
              type="file"
              accept="image/*"
              multiple
              onChange={handleExtraImages}
              className="hidden"
            />
          </div>
        </div>

        {/* Building Details */}
        <div className="bg-white border rounded-2xl p-6 shadow-sm">

          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-6">
            Building Details
          </h2>

          <div className="grid md:grid-cols-2 gap-4">

            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Property Name"
              className="input-field"
              required
            />

            <input
              name="totalUnits"
              type="number"
              value={form.totalUnits}
              onChange={handleChange}
              placeholder="Total Units"
              className="input-field"
            />

            <input
              name="floors"
              type="number"
              value={form.floors}
              onChange={handleChange}
              placeholder="Floors"
              className="input-field"
            />

            <input
              name="landSize"
              value={form.landSize}
              onChange={handleChange}
              placeholder="Land Size"
              className="input-field"
            />

            <input
              name="handoverTime"
              value={form.handoverTime}
              onChange={handleChange}
              placeholder="Handover Time"
              className="input-field"
            />

            <input
              name="parkingArea"
              value={form.parkingArea}
              onChange={handleChange}
              placeholder="Parking Area"
              className="input-field"
            />

            <input
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Full Address"
              className="input-field md:col-span-2"
              required
            />
          </div>
        </div>

        {/* Apartment Sizes */}
        <div className="bg-white border rounded-2xl p-6 shadow-sm">

          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-semibold uppercase text-gray-700">
              Apartment Sizes
            </h2>

            <button
              type="button"
              onClick={addSizeRow}
              className="text-indigo-600 flex items-center gap-1 text-sm font-medium"
            >
              <Plus size={14} /> Add Row
            </button>
          </div>

          <div className="space-y-3">

            {aptSizes.map((row, i) => (
              <div key={i} className="grid grid-cols-[1fr_1fr_40px] gap-3">

                <input
                  value={row.type}
                  onChange={(e) =>
                    updateSize(i, "type", e.target.value)
                  }
                  placeholder="Type"
                  className="input-field"
                />

                <input
                  value={row.size}
                  onChange={(e) =>
                    updateSize(i, "size", e.target.value)
                  }
                  placeholder="Size"
                  className="input-field"
                />

                <button
                  type="button"
                  onClick={() => removeSizeRow(i)}
                  disabled={aptSizes.length === 1}
                  className="flex items-center justify-center text-gray-400 hover:text-red-500"
                >
                  <Trash2 size={16} />
                </button>

              </div>
            ))}

          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-3 rounded-xl flex items-center justify-center gap-2 font-semibold hover:bg-indigo-700 disabled:opacity-60"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload size={18} />
              Add Building
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default AddBuilding;