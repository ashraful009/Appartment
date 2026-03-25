import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { ShieldCheck, Upload, Inbox, Lock } from "lucide-react";

import DocumentCard from "../../components/customer/vault/DocumentCard";
import UploadDocumentModal from "../../components/customer/vault/UploadDocumentModal";

// ── Skeleton card ─────────────────────────────────────────────────────────────
const CardSkeleton = () => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-start gap-4 animate-pulse">
    <div className="w-12 h-12 rounded-xl bg-gray-200 flex-shrink-0" />
    <div className="flex-1 space-y-2.5">
      <div className="h-4 w-32 bg-gray-200 rounded" />
      <div className="h-3 w-20 bg-gray-100 rounded" />
      <div className="flex gap-2 mt-3">
        <div className="h-7 w-14 bg-gray-200 rounded-lg" />
        <div className="h-7 w-14 bg-gray-200 rounded-lg" />
      </div>
    </div>
  </div>
);

// ── Main Page ─────────────────────────────────────────────────────────────────
const DocumentVaultPage = () => {
  const [documents,   setDocuments]   = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ── Fetch (called on mount AND after a successful upload) ──────────────
  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/documents", {
        withCredentials: true,
      });
      setDocuments(data.documents ?? []);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load documents.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDocuments(); }, [fetchDocuments]);

  // ── Re-fetch after a successful upload ────────────────────────────────
  const handleUploadSuccess = () => {
    fetchDocuments();
  };

  // ── Delete ─────────────────────────────────────────────────────────────
  const handleDelete = async (docId) => {
    try {
      await axios.delete(`/api/documents/${docId}`, { withCredentials: true });
      setDocuments((prev) => prev.filter((d) => d._id !== docId));
      toast.success("Document deleted.");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete document.");
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-10">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-brand-500 mb-1">
            Customer Panel
          </p>
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-2.5">
            <ShieldCheck size={28} className="text-brand-600" />
            My Document Vault
          </h1>
          <p className="text-gray-500 text-sm mt-1.5 max-w-lg flex items-start gap-1.5">
            <Lock size={13} className="text-gray-400 flex-shrink-0 mt-0.5" />
            Your documents are securely stored and shared only with your
            assigned property agent to speed up the booking process.
          </p>
        </div>

        {/* ── Upload button ─────────────────────────────────────── */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold shadow-sm transition-colors flex-shrink-0"
        >
          <Upload size={15} />
          Upload New Document
        </button>
      </div>

      {/* ── Body ──────────────────────────────────────────────────────── */}
      {loading ? (
        /* ── Skeleton grid ───────────────────────────────────────── */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>

      ) : documents.length === 0 ? (
        /* ── Empty state ─────────────────────────────────────────── */
        <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-2xl border-2 border-dashed border-gray-200">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-5">
            <Inbox size={28} className="text-gray-300" />
          </div>
          <p className="text-base font-bold text-gray-600 mb-2">
            No documents uploaded yet
          </p>
          <p className="text-sm text-gray-400 max-w-xs leading-relaxed mb-6">
            Upload your <strong className="text-gray-500">NID</strong> or{" "}
            <strong className="text-gray-500">TIN Certificate</strong> to speed
            up the booking process. Documents are visible only to your assigned agent.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold shadow-sm transition-colors"
          >
            <Upload size={14} />
            Upload Your First Document
          </button>
        </div>

      ) : (
        /* ── Document cards grid ─────────────────────────────────── */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((doc) => (
            <DocumentCard
              key={doc._id}
              document={doc}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* ── Upload modal ─────────────────────────────────────────────── */}
      <UploadDocumentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleUploadSuccess}
      />
    </div>
  );
};

export default DocumentVaultPage;
