import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { X, UploadCloud, Loader2, FileCheck2 } from "lucide-react";

const DOCUMENT_TYPES = [
  "NID",
  "Passport",
  "TIN Certificate",
  "Booking Receipt",
  "Other",
];

/**
 * UploadDocumentModal — Tailwind backdrop modal for uploading a document.
 * Props:
 *   isOpen     {boolean}
 *   onClose    {function}
 *   onSuccess  {function}  — called after a successful upload with the new document
 */
const UploadDocumentModal = ({ isOpen, onClose, onSuccess }) => {
  const [title,      setTitle]      = useState(DOCUMENT_TYPES[0]);
  const [file,       setFile]       = useState(null);
  const [uploading,  setUploading]  = useState(false);
  const [dragOver,   setDragOver]   = useState(false);
  const fileInputRef                = useRef(null);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setTitle(DOCUMENT_TYPES[0]);
      setFile(null);
      setUploading(false);
    }
  }, [isOpen]);

  // ── Keyboard close ──────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    if (isOpen) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // ── File selection helpers ───────────────────────────────────────────────
  const handleFileChange = (e) => setFile(e.target.files[0] ?? null);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  };

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return toast.error("Please select a file to upload.");

    const formData = new FormData();
    formData.append("title",    title);
    formData.append("document", file); // field name must match uploadMiddleware

    setUploading(true);
    try {
      const { data } = await axios.post("/api/documents", formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Document uploaded successfully!");
      onSuccess(data.document);
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Upload failed. Try again.");
    } finally {
      setUploading(false);
    }
  };

  const fileSizeLabel = file
    ? `${file.name} (${(file.size / 1024).toFixed(1)} KB)`
    : null;

  return (
    /* ── Backdrop ─────────────────────────────────────────────────────────── */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      {/* ── Modal panel ───────────────────────────────────────────────────── */}
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-extrabold text-gray-900">Upload Document</h2>
            <p className="text-xs text-gray-400 mt-0.5">PDF, JPG, or PNG — max 10 MB</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* ── Document type dropdown ─────────────────────────────────────── */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Document Type
            </label>
            <select
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition"
              required
            >
              {DOCUMENT_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* ── Drag-and-drop file zone ────────────────────────────────────── */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              File
            </label>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`cursor-pointer border-2 border-dashed rounded-xl px-4 py-6 flex flex-col items-center justify-center text-center transition-colors
                ${dragOver
                  ? "border-brand-400 bg-brand-50"
                  : file
                    ? "border-emerald-300 bg-emerald-50"
                    : "border-gray-200 bg-gray-50 hover:border-brand-300 hover:bg-brand-50/40"
                }`}
            >
              {file ? (
                <>
                  <FileCheck2 size={28} className="text-emerald-500 mb-2" />
                  <p className="text-xs font-semibold text-emerald-700 max-w-xs truncate">
                    {fileSizeLabel}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-1">Click to change file</p>
                </>
              ) : (
                <>
                  <UploadCloud size={28} className="text-gray-300 mb-2" />
                  <p className="text-xs font-semibold text-gray-500">
                    Drag & drop or <span className="text-brand-600">browse</span>
                  </p>
                  <p className="text-[11px] text-gray-400 mt-1">PDF, JPG, PNG up to 10 MB</p>
                </>
              )}
            </div>

            {/* Hidden native file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* ── Actions ────────────────────────────────────────────────────── */}
          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading || !file}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all shadow-sm"
            >
              {uploading ? (
                <><Loader2 size={14} className="animate-spin" /> Uploading…</>
              ) : (
                <><UploadCloud size={14} /> Upload</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadDocumentModal;
