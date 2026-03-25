import React from "react";
import { FileText, Trash2, ExternalLink, FileImage, File } from "lucide-react";

// ── Status badge styles ───────────────────────────────────────────────────────
const STATUS_STYLE = {
  "Pending Verification": "bg-amber-100 text-amber-700 border-amber-200",
  "Verified":             "bg-emerald-100 text-emerald-700 border-emerald-200",
  "Rejected":             "bg-red-100 text-red-700 border-red-200",
};

const STATUS_DOT = {
  "Pending Verification": "bg-amber-400",
  "Verified":             "bg-emerald-400",
  "Rejected":             "bg-red-400",
};

// ── Pick an icon based on guessed file type ───────────────────────────────────
const FileIcon = ({ url }) => {
  if (!url) return <File size={28} className="text-gray-400" />;
  const isPdf = url.toLowerCase().includes(".pdf") || url.includes("/raw/");
  const isImg = /\.(jpg|jpeg|png|webp|gif)/i.test(url);
  if (isPdf) return <FileText size={28} className="text-red-400" />;
  if (isImg) return <FileImage size={28} className="text-brand-400" />;
  return <File size={28} className="text-gray-400" />;
};

const formatDate = (d) =>
  d
    ? new Intl.DateTimeFormat("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(new Date(d))
    : "—";

/**
 * DocumentCard — a single uploaded document tile.
 * Props:
 *   document  {object}   — Document model document
 *   onDelete  {function} — called with document._id when Delete is confirmed
 */
const DocumentCard = ({ document, onDelete }) => {
  const { _id, title, fileUrl, status, uploadedAt } = document;

  const handleDelete = () => {
    if (window.confirm(`Delete "${title}"? This cannot be undone.`)) {
      onDelete(_id);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-4 flex items-start gap-4 relative">

      {/* ── File type icon ──────────────────────────────────────────── */}
      <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
        <FileIcon url={fileUrl} />
      </div>

      {/* ── Body ────────────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0 pr-2">
        <p className="text-sm font-bold text-gray-900 truncate">{title}</p>
        <p className="text-xs text-gray-400 mt-0.5">
          Uploaded {formatDate(uploadedAt)}
        </p>

        {/* ── Action buttons ─────────────────────────────────────────── */}
        <div className="flex items-center gap-2 mt-3">
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-semibold transition-colors"
          >
            <ExternalLink size={12} />
            View
          </a>
          <button
            onClick={handleDelete}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold transition-colors"
          >
            <Trash2 size={12} />
            Delete
          </button>
        </div>
      </div>

      {/* ── Status badge — top right ────────────────────────────────── */}
      <span
        className={`absolute top-3 right-3 inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border ${
          STATUS_STYLE[status] ?? STATUS_STYLE["Pending Verification"]
        }`}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            STATUS_DOT[status] ?? STATUS_DOT["Pending Verification"]
          }`}
        />
        {status}
      </span>
    </div>
  );
};

export default DocumentCard;
