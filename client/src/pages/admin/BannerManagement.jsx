import React, { useState, useRef } from "react";
import axios from "axios";
import { ImagePlus, X, CheckCircle, AlertCircle, Upload } from "lucide-react";

const Toast = ({ type, msg, onClose }) => (
  <div className={`fixed bottom-6 right-6 z-50 flex items-start gap-3 px-5 py-4 rounded-2xl shadow-xl text-sm font-medium max-w-sm transition-all ${
    type === "success" ? "bg-emerald-50 border border-emerald-200 text-emerald-800" : "bg-red-50 border border-red-200 text-red-700"
  }`}>
    {type === "success" ? <CheckCircle size={18} className="flex-shrink-0 mt-0.5" /> : <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />}
    <span>{msg}</span>
    <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100"><X size={14} /></button>
  </div>
);

const BannerManagement = () => {
  const [files, setFiles]                 = useState([]);
  const [previews, setPreviews]           = useState([]);
  const [motivationalText, setMotivationalText] = useState("");
  const [contactInfo, setContactInfo]     = useState("");
  const [loading, setLoading]             = useState(false);
  const [toast, setToast]                 = useState(null);
  const fileRef                           = useRef(null);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    if (selected.length === 0) return;

    // Merge with existing (up to 10)
    const merged = [...files, ...selected].slice(0, 10);
    setFiles(merged);
    const urls = merged.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
  };

  const removeImage = (idx) => {
    const newFiles    = files.filter((_, i) => i !== idx);
    const newPreviews = previews.filter((_, i) => i !== idx);
    setFiles(newFiles);
    setPreviews(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (files.length === 0) {
      showToast("error", "Please select at least one banner image.");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      files.forEach((f) => formData.append("images", f));
      formData.append("motivationalText", motivationalText);
      formData.append("contactInfo",      contactInfo);

      await axios.post("/api/admin/banners", formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      showToast("success", "Banner uploaded to Cloudinary successfully!");
      setFiles([]);
      setPreviews([]);
      setMotivationalText("");
      setContactInfo("");
      if (fileRef.current) fileRef.current.value = "";
    } catch (err) {
      showToast("error", err?.response?.data?.message || "Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-3xl">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-gray-800">Manage Banners</h1>
        <p className="text-gray-500 text-sm mt-1">Upload homepage banners — images go straight to Cloudinary.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ── Image Drop Zone ── */}
        <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 hover:border-brand-400 p-6 transition-colors">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
            id="banner-images"
          />

          {previews.length === 0 ? (
            <label htmlFor="banner-images" className="flex flex-col items-center gap-3 cursor-pointer py-8">
              <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center">
                <ImagePlus size={28} className="text-brand-500" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-700">Click to select images</p>
                <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP · Max 10 images · 5 MB each</p>
              </div>
            </label>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {previews.map((src, i) => (
                  <div key={i} className="relative group rounded-xl overflow-hidden aspect-video bg-gray-100">
                    <img src={src} alt={`preview-${i}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
                {/* Add more button */}
                {files.length < 10 && (
                  <label htmlFor="banner-images" className="cursor-pointer rounded-xl border-2 border-dashed border-gray-200 hover:border-brand-400 aspect-video flex items-center justify-center transition-colors">
                    <div className="text-center">
                      <ImagePlus size={20} className="text-gray-400 mx-auto" />
                      <p className="text-xs text-gray-400 mt-1">Add more</p>
                    </div>
                  </label>
                )}
              </div>
              <p className="text-xs text-gray-400">{files.length} / 10 images selected</p>
            </div>
          )}
        </div>

        {/* ── Text Fields ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <div>
            <label className="form-label">Motivational Sentence</label>
            <input
              type="text"
              value={motivationalText}
              onChange={(e) => setMotivationalText(e.target.value)}
              placeholder='e.g. "Find Your Dream Home Today"'
              className="input-field"
            />
          </div>
          <div>
            <label className="form-label">Contact Information</label>
            <input
              type="text"
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
              placeholder="e.g. +880 1700-000000 | info@appartment.com"
              className="input-field"
            />
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
              Uploading to Cloudinary…
            </>
          ) : (
            <>
              <Upload size={18} />
              Upload Banner
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default BannerManagement;
