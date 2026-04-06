import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import {
  ImagePlay,
  Video,
  Image,
  Upload,
  PencilLine,
  Trash2,
  X,
  CheckCircle,
  AlertCircle,
  Monitor,
  Smartphone,
  Plus,
  Eye,
  EyeOff,
  RefreshCw,
  Layers,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Toast Notification
// ─────────────────────────────────────────────────────────────────────────────
const Toast = ({ type, msg, onClose }) => (
  <div
    className={`fixed bottom-6 right-6 z-[100] flex items-start gap-3 px-5 py-4 rounded-2xl shadow-2xl text-sm font-medium max-w-sm border backdrop-blur-sm transition-all duration-300 ${
      type === "success"
        ? "bg-emerald-50 border-emerald-200 text-emerald-800"
        : "bg-red-50 border-red-200 text-red-700"
    }`}
  >
    {type === "success" ? (
      <CheckCircle size={18} className="flex-shrink-0 mt-0.5" />
    ) : (
      <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
    )}
    <span className="flex-1 leading-snug">{msg}</span>
    <button
      onClick={onClose}
      className="opacity-50 hover:opacity-100 transition-opacity flex-shrink-0"
    >
      <X size={14} />
    </button>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Media Type Toggle
// ─────────────────────────────────────────────────────────────────────────────
const MediaTypeToggle = ({ value, onChange }) => (
  <div className="flex p-1 bg-gray-100 rounded-xl gap-1">
    {[
      { key: "image", label: "Upload Image", icon: Image },
      { key: "video", label: "Upload Video", icon: Video },
    ].map(({ key, label, icon: Icon }) => (
      <button
        key={key}
        type="button"
        onClick={() => onChange(key)}
        className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${
          value === key
            ? "bg-white text-brand-700 shadow-sm border border-gray-200"
            : "text-gray-500 hover:text-gray-700"
        }`}
      >
        <Icon size={15} />
        {label}
      </button>
    ))}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Single Media Upload Slot (Desktop or Mobile)
// ─────────────────────────────────────────────────────────────────────────────
const MediaSlot = ({
  id,
  label,
  icon: SlotIcon,
  mediaType,
  file,
  existingUrl,
  onChange,
}) => {
  const inputRef = useRef(null);
  const accept = mediaType === "video" ? "video/mp4,video/webm,video/mov" : "image/*";
  const preview = file ? URL.createObjectURL(file) : null;
  const displayUrl = preview || existingUrl;

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
        <SlotIcon size={14} className="text-brand-500" />
        {label}
      </label>

      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => onChange(e.target.files?.[0] || null)}
      />

      {displayUrl ? (
        <div className="relative group rounded-xl overflow-hidden border border-gray-200 bg-gray-50 aspect-video">
          {mediaType === "video" ? (
            <video
              src={displayUrl}
              className="w-full h-full object-cover"
              muted
              loop
              autoPlay
            />
          ) : (
            <img
              src={displayUrl}
              alt={label}
              className="w-full h-full object-cover"
            />
          )}

          {/* Overlay actions */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex items-center gap-1.5 bg-white text-gray-800 text-xs font-semibold px-3 py-2 rounded-lg hover:bg-gray-100 transition"
            >
              <RefreshCw size={13} />
              Replace
            </button>
            {file && (
              <button
                type="button"
                onClick={() => onChange(null)}
                className="flex items-center gap-1.5 bg-red-500 text-white text-xs font-semibold px-3 py-2 rounded-lg hover:bg-red-600 transition"
              >
                <X size={13} />
                Remove
              </button>
            )}
          </div>

          {/* Label badge */}
          <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            <SlotIcon size={10} />
            {label.split(" ")[0]}
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center py-8 gap-2 hover:border-brand-400 hover:bg-brand-50/30 transition-all duration-200 text-gray-400 hover:text-brand-500 aspect-video"
        >
          {mediaType === "video" ? (
            <Video size={24} />
          ) : (
            <Image size={24} />
          )}
          <span className="text-xs font-semibold">Click to upload {label}</span>
        </button>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Banner Card (Grid Item)
// ─────────────────────────────────────────────────────────────────────────────
const BannerCard = ({ banner, onEdit, onDelete, onToggle, deleting, toggling }) => {
  const isVideo = banner.mediaType === "video";

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200 group">
      {/* Preview thumbnail */}
      <div className="relative aspect-video bg-gray-100 overflow-hidden">
        {isVideo ? (
          <video
            src={banner.desktopMediaUrl}
            className="w-full h-full object-cover"
            muted
            loop
            onMouseEnter={(e) => e.target.play()}
            onMouseLeave={(e) => { e.target.pause(); e.target.currentTime = 0; }}
          />
        ) : (
          <img
            src={banner.desktopMediaUrl}
            alt={banner.title || "Banner"}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        )}

        {/* Overlay badges */}
        <div className="absolute top-2 left-2 flex gap-1.5">
          <span
            className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
              isVideo
                ? "bg-purple-500 text-white"
                : "bg-blue-500 text-white"
            }`}
          >
            {isVideo ? <Video size={9} /> : <Image size={9} />}
            {isVideo ? "VIDEO" : "IMAGE"}
          </span>

          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              banner.isActive
                ? "bg-emerald-500 text-white"
                : "bg-gray-400 text-white"
            }`}
          >
            {banner.isActive ? "ACTIVE" : "INACTIVE"}
          </span>
        </div>

        {/* Mobile preview indicator */}
        <div className="absolute bottom-2 right-2 bg-black/60 text-white rounded-lg px-2 py-1 flex items-center gap-1 text-[10px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
          <Smartphone size={10} />
          +Mobile
        </div>
      </div>

      {/* Card body */}
      <div className="p-4 space-y-3">
        <div>
          <p className="font-semibold text-gray-800 truncate text-sm">
            {banner.title || <span className="text-gray-400 italic">Untitled Banner</span>}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {new Date(banner.createdAt).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>

        {/* Actions row */}
        <div className="flex items-center gap-2 pt-1 border-t border-gray-50">
          {/* Toggle active */}
          <button
            type="button"
            onClick={() => onToggle(banner)}
            disabled={toggling === banner._id}
            className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all ${
              banner.isActive
                ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            } disabled:opacity-50`}
            title={banner.isActive ? "Deactivate" : "Activate"}
          >
            {toggling === banner._id ? (
              <RefreshCw size={11} className="animate-spin" />
            ) : banner.isActive ? (
              <Eye size={11} />
            ) : (
              <EyeOff size={11} />
            )}
            {banner.isActive ? "Active" : "Inactive"}
          </button>

          <div className="flex-1" />

          {/* Edit */}
          <button
            type="button"
            onClick={() => onEdit(banner)}
            className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-brand-50 text-brand-700 hover:bg-brand-100 transition"
          >
            <PencilLine size={11} />
            Edit
          </button>

          {/* Delete */}
          <button
            type="button"
            onClick={() => onDelete(banner)}
            disabled={deleting === banner._id}
            className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition disabled:opacity-50"
          >
            {deleting === banner._id ? (
              <RefreshCw size={11} className="animate-spin" />
            ) : (
              <Trash2 size={11} />
            )}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Delete Confirm Modal
// ─────────────────────────────────────────────────────────────────────────────
const DeleteConfirmModal = ({ banner, onConfirm, onCancel, loading }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
      <div className="p-6 text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto">
          <Trash2 size={24} className="text-red-500" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">Delete Banner?</h3>
          <p className="text-sm text-gray-500 mt-1">
            "{banner.title || "Untitled Banner"}" will be permanently removed from Cloudinary and the database.
          </p>
        </div>
      </div>
      <div className="flex gap-3 p-5 border-t border-gray-100 bg-gray-50">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="flex-1 py-2.5 px-4 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition text-sm"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className="flex-1 py-2.5 px-4 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition text-sm flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Deleting…
            </>
          ) : (
            <>
              <Trash2 size={14} />
              Yes, Delete
            </>
          )}
        </button>
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Upload / Edit Modal
// ─────────────────────────────────────────────────────────────────────────────
const BannerModal = ({ editingBanner, onClose, onSuccess, showToast }) => {
  const isEdit = !!editingBanner;

  const [mediaType, setMediaType] = useState(editingBanner?.mediaType || "image");
  const [title, setTitle] = useState(editingBanner?.title || "");
  const [isActive, setIsActive] = useState(editingBanner?.isActive ?? true);
  const [desktopFile, setDesktopFile] = useState(null);
  const [mobileFile, setMobileFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate: new banners need both files; edits can update selectively
    if (!isEdit && (!desktopFile || !mobileFile)) {
      showToast("error", "Both desktop and mobile media files are required.");
      return;
    }

    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("title", title);
      fd.append("mediaType", mediaType);
      fd.append("isActive", String(isActive));
      if (desktopFile) fd.append("desktopMedia", desktopFile);
      if (mobileFile)  fd.append("mobileMedia", mobileFile);

      if (isEdit) {
        await axios.put(`/api/admin/banners/${editingBanner._id}`, fd, {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        });
        showToast("success", "Banner updated successfully!");
      } else {
        await axios.post("/api/admin/banners", fd, {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        });
        showToast("success", "Banner created successfully!");
      }

      onSuccess();
    } catch (err) {
      showToast("error", err?.response?.data?.message || "Operation failed. Try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 py-6 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto">

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-100 flex items-center justify-center">
              {isEdit ? <PencilLine size={16} className="text-brand-600" /> : <Plus size={16} className="text-brand-600" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">
                {isEdit ? "Edit Banner" : "New Banner"}
              </h2>
              <p className="text-xs text-gray-400">
                {isEdit ? "Update banner details and media" : "Upload desktop + mobile media"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">

          {/* Media Type Toggle */}
          <div className="space-y-2">
            <label className="form-label">Media Type</label>
            <MediaTypeToggle value={mediaType} onChange={setMediaType} />
          </div>

          {/* Size helper */}
          <div className="flex items-start gap-2.5 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-xs text-blue-700">
            <Monitor size={13} className="flex-shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p><span className="font-semibold">Desktop:</span> 1920×800 px &nbsp;|&nbsp; <span className="font-semibold">Mobile:</span> 1080×1350 px</p>
              <p className="text-blue-500">
                {mediaType === "video"
                  ? "Max file size: 50 MB · Formats: MP4, WebM, MOV"
                  : "Max file size: 5 MB · Formats: JPG, PNG, WebP, AVIF"}
              </p>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="form-label">Title <span className="font-normal text-gray-400">(optional)</span></label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder='e.g. "Summer Sale Banner"'
              className="input-field"
            />
          </div>

          {/* Dual upload */}
          <div className="grid grid-cols-2 gap-4">
            <MediaSlot
              id="desktop-media"
              label="Desktop Media"
              icon={Monitor}
              mediaType={mediaType}
              file={desktopFile}
              existingUrl={isEdit ? editingBanner.desktopMediaUrl : null}
              onChange={setDesktopFile}
            />
            <MediaSlot
              id="mobile-media"
              label="Mobile Media"
              icon={Smartphone}
              mediaType={mediaType}
              file={mobileFile}
              existingUrl={isEdit ? editingBanner.mobileMediaUrl : null}
              onChange={setMobileFile}
            />
          </div>

          {/* Active toggle */}
          <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
            <div>
              <p className="text-sm font-semibold text-gray-700">Set as Active</p>
              <p className="text-xs text-gray-400 mt-0.5">Active banners are shown on the homepage</p>
            </div>
            <button
              type="button"
              onClick={() => setIsActive((v) => !v)}
              className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${
                isActive ? "bg-brand-600" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                  isActive ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Footer */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 px-4 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700 transition text-sm flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {isEdit ? "Saving…" : "Uploading…"}
                </>
              ) : (
                <>
                  <Upload size={15} />
                  {isEdit ? "Save Changes" : "Create Banner"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────
const BannerManagement = () => {
  const [banners, setBanners]         = useState([]);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [toast, setToast]             = useState(null);
  const [showModal, setShowModal]     = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);  // null = create mode
  const [deletingTarget, setDeletingTarget] = useState(null); // banner to confirm-delete
  const [deleting, setDeleting]       = useState(null);  // banner._id being deleted
  const [toggling, setToggling]       = useState(null);  // banner._id being toggled

  const showToast = useCallback((type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4500);
  }, []);

  const fetchBanners = useCallback(async () => {
    setFetchLoading(true);
    try {
      const { data } = await axios.get("/api/admin/banners", { withCredentials: true });
      setBanners(data.banners || []);
    } catch {
      showToast("error", "Failed to load banners.");
    } finally {
      setFetchLoading(false);
    }
  }, [showToast]);

  useEffect(() => { fetchBanners(); }, [fetchBanners]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const openCreate = () => { setEditingBanner(null); setShowModal(true); };
  const openEdit   = (banner) => { setEditingBanner(banner); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditingBanner(null); };

  const handleModalSuccess = () => {
    closeModal();
    fetchBanners();
  };

  const handleToggle = async (banner) => {
    setToggling(banner._id);
    try {
      const fd = new FormData();
      fd.append("isActive", String(!banner.isActive));
      await axios.put(`/api/admin/banners/${banner._id}`, fd, { withCredentials: true });
      setBanners((prev) =>
        prev.map((b) => (b._id === banner._id ? { ...b, isActive: !banner.isActive } : b))
      );
      showToast("success", `Banner ${!banner.isActive ? "activated" : "deactivated"}.`);
    } catch {
      showToast("error", "Failed to update banner status.");
    } finally {
      setToggling(null);
    }
  };

  const confirmDelete = async () => {
    if (!deletingTarget) return;
    setDeleting(deletingTarget._id);
    try {
      await axios.delete(`/api/admin/banners/${deletingTarget._id}`, { withCredentials: true });
      setBanners((prev) => prev.filter((b) => b._id !== deletingTarget._id));
      showToast("success", "Banner deleted successfully.");
    } catch {
      showToast("error", "Failed to delete banner.");
    } finally {
      setDeleting(null);
      setDeletingTarget(null);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  const activeCount   = banners.filter((b) => b.isActive).length;
  const inactiveCount = banners.length - activeCount;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
            <ImagePlay size={24} className="text-brand-600" />
            Banner Management
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage homepage banners — supports both image and video with device-specific uploads.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all text-sm"
        >
          <Plus size={16} />
          New Banner
        </button>
      </div>

      {/* Stats row */}
      {!fetchLoading && banners.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Banners", value: banners.length, icon: Layers, color: "bg-blue-50 text-blue-600 border-blue-100" },
            { label: "Active",        value: activeCount,   icon: Eye,    color: "bg-emerald-50 text-emerald-600 border-emerald-100" },
            { label: "Inactive",      value: inactiveCount, icon: EyeOff, color: "bg-gray-50 text-gray-500 border-gray-100" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${color}`}>
              <Icon size={18} />
              <div>
                <p className="text-xl font-extrabold leading-none">{value}</p>
                <p className="text-xs font-medium opacity-70 mt-0.5">{label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Banner Grid */}
      {fetchLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
              <div className="aspect-video bg-gray-100 animate-pulse" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-100 rounded animate-pulse w-2/3" />
                <div className="h-3 bg-gray-100 rounded animate-pulse w-1/3" />
                <div className="flex gap-2 pt-2 border-t border-gray-50">
                  <div className="h-7 bg-gray-100 rounded-lg animate-pulse w-20" />
                  <div className="h-7 bg-gray-100 rounded-lg animate-pulse w-16 ml-auto" />
                  <div className="h-7 bg-gray-100 rounded-lg animate-pulse w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : banners.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center mx-auto mb-4">
            <ImagePlay size={28} className="text-brand-400" />
          </div>
          <h3 className="text-base font-bold text-gray-700">No banners yet</h3>
          <p className="text-sm text-gray-400 mt-1 mb-5">
            Create your first banner to get started.
          </p>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 bg-brand-600 text-white font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-brand-700 transition"
          >
            <Plus size={15} />
            Create Banner
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {banners.map((banner) => (
            <BannerCard
              key={banner._id}
              banner={banner}
              onEdit={openEdit}
              onDelete={setDeletingTarget}
              onToggle={handleToggle}
              deleting={deleting}
              toggling={toggling}
            />
          ))}
        </div>
      )}

      {/* Upload / Edit Modal */}
      {showModal && (
        <BannerModal
          editingBanner={editingBanner}
          onClose={closeModal}
          onSuccess={handleModalSuccess}
          showToast={showToast}
        />
      )}

      {/* Delete Confirm Modal */}
      {deletingTarget && (
        <DeleteConfirmModal
          banner={deletingTarget}
          onConfirm={confirmDelete}
          onCancel={() => setDeletingTarget(null)}
          loading={!!deleting}
        />
      )}
    </div>
  );
};

export default BannerManagement;