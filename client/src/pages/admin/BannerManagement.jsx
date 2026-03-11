import React, { useState, useRef } from "react";
import axios from "axios";
import { ImagePlus, X, CheckCircle, AlertCircle, Upload } from "lucide-react";

const Toast = ({ type, msg, onClose }) => (
  <div
    className={`fixed bottom-6 right-6 z-50 flex items-start gap-3 px-5 py-4 rounded-xl shadow-lg text-sm font-medium max-w-sm ${type === "success"
        ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
        : "bg-red-50 border border-red-200 text-red-700"
      }`}
  >
    {type === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
    <span className="flex-1">{msg}</span>
    <button onClick={onClose} className="opacity-60 hover:opacity-100">
      <X size={14} />
    </button>
  </div>
);

const BannerManagement = () => {
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [motivationalText, setMotivationalText] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const fileRef = useRef(null);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    if (selected.length === 0) return;

    const merged = [...files, ...selected].slice(0, 10);
    setFiles(merged);

    const urls = merged.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
  };

  const removeImage = (idx) => {
    const newFiles = files.filter((_, i) => i !== idx);
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
      formData.append("contactInfo", contactInfo);

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
      showToast(
        "error",
        err?.response?.data?.message || "Upload failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8">

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Homepage Banner Management
        </h1>
        <p className="text-gray-500 text-sm mt-2">
          Upload and manage homepage banner images with marketing text.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">

        {/* Upload Card */}
        <div className="bg-white border rounded-2xl shadow-sm p-6">

          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-700 mb-6">
            Banner Images
          </h2>

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
            <label
              htmlFor="banner-images"
              className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl cursor-pointer py-12 hover:border-indigo-400 transition"
            >
              <div className="w-16 h-16 rounded-xl bg-indigo-50 flex items-center justify-center mb-3">
                <ImagePlus size={28} className="text-indigo-500" />
              </div>

              <p className="text-sm font-semibold text-gray-700">
                Click to upload banner images
              </p>

              <p className="text-xs text-gray-400 mt-1">
                JPG, PNG, WebP · Max 10 images · 5MB each
              </p>
            </label>
          ) : (
            <div className="space-y-4">

              <div className="grid grid-cols-3 gap-4">

                {previews.map((src, i) => (
                  <div
                    key={i}
                    className="relative group rounded-xl overflow-hidden aspect-video"
                  >
                    <img
                      src={src}
                      alt={`preview-${i}`}
                      className="w-full h-full object-cover"
                    />

                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}

                {files.length < 10 && (
                  <label
                    htmlFor="banner-images"
                    className="border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center cursor-pointer aspect-video hover:border-indigo-400"
                  >
                    <div className="text-center">
                      <ImagePlus size={20} className="text-gray-400 mx-auto" />
                      <p className="text-xs text-gray-400 mt-1">
                        Add More
                      </p>
                    </div>
                  </label>
                )}
              </div>

              <p className="text-xs text-gray-400">
                {files.length} / 10 images selected
              </p>
            </div>
          )}
        </div>

        {/* Text Section */}
        <div className="bg-white border rounded-2xl shadow-sm p-6 space-y-5">

          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-700">
            Banner Content
          </h2>

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

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-3.5 rounded-xl flex items-center justify-center gap-2 font-semibold hover:bg-indigo-700 disabled:opacity-60"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Uploading to Cloudinary...
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