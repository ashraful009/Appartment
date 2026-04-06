import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import {
  FileDown,
  ReceiptText,
  AlertCircle,
  ChevronDown,
  X,
  Car,
  Wrench,
  Layers,
  BadgeDollarSign,
  AlertTriangle,
} from "lucide-react";

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmt = (n) =>
  n != null ? `৳ ${Number(n).toLocaleString("en-BD")}` : "—";

const fmtDate = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });
};

// ── Status Badge ──────────────────────────────────────────────────────────────

const STATUS_CFG = {
  Paid:    { dot: "bg-emerald-500", pill: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  Pending: { dot: "bg-amber-400",   pill: "bg-amber-50   text-amber-700   ring-amber-200"  },
  Overdue: { dot: "bg-red-500",     pill: "bg-red-50     text-red-700     ring-red-200"    },
  Unpaid:  { dot: "bg-gray-400",    pill: "bg-gray-50    text-gray-700    ring-gray-200 cursor-pointer hover:bg-gray-100 hover:ring-gray-300 transition-all border border-transparent hover:border-gray-200 shadow-sm" },
};

const StatusBadge = ({ status, onClick }) => {
  const cfg = STATUS_CFG[status] ?? STATUS_CFG.Pending;
  const isUnpaid = status === "Unpaid";
  
  return (
    <span 
      onClick={isUnpaid ? onClick : undefined}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ${cfg.pill}`}
      title={isUnpaid ? "Click to upload payment proof" : ""}
    >
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
      {status ?? "Pending"}
      {isUnpaid && <span className="ml-1 text-[10px] text-brand-600 underline decoration-dashed pointer-events-none">Pay Now</span>}
    </span>
  );
};

// ── Payment Modal ─────────────────────────────────────────────────────────────

const PaymentModal = ({ open, onClose, onSubmit, loading, installmentName }) => {
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [file, setFile] = useState(null);

  useEffect(() => {
    if (!open) {
      setBankName("");
      setAccountNumber("");
      setFile(null);
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div 
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-gray-100 flex flex-col"
        style={{ animation: "fadeUp 0.2s ease-out both" }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div>
            <h3 className="font-extrabold text-gray-900 text-lg flex items-center gap-2">
              <BadgeDollarSign className="text-brand-600" /> Payment Proof
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">Upload receipt for <span className="font-semibold text-gray-700">{installmentName}</span></p>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Bank Name <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              placeholder="e.g. Brac Bank, DBBL"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Account Number <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="e.g. 102XXXXXXXX"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Invoice / Receipt (Image or PDF) <span className="text-red-500">*</span></label>
            <input 
              type="file" 
              onChange={(e) => setFile(e.target.files[0])}
              accept=".jpg,.jpeg,.png,.webp,.pdf"
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 cursor-pointer border border-gray-200 rounded-xl bg-gray-50 transition-all"
            />
            <p className="text-[10px] text-gray-400 mt-1.5 ml-1">Max size: 10MB.</p>
          </div>
        </div>

        <div className="p-6 pt-2 border-t border-gray-100 flex gap-3">
          <button 
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={() => onSubmit({ bankName, accountNumber, file })}
            disabled={loading || !bankName.trim() || !accountNumber.trim() || !file}
            className="flex-1 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-bold hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Submit Proof"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Charge Breakdown Popover ──────────────────────────────────────────────────

const ChargePopover = ({ breakdown, latePenalty }) => {
  const [open, setOpen] = useState(false);
  const ref             = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const rows = [
    { icon: BadgeDollarSign, label: "Base Amount",       value: breakdown?.baseAmount      ?? 0 },
    { icon: Car,             label: "Parking",           value: breakdown?.parking          ?? 0 },
    { icon: Wrench,          label: "Financial Service", value: breakdown?.financialService ?? 0 },
    { icon: Layers,          label: "Service Charge",    value: breakdown?.serviceCharge    ?? 0 },
    { icon: AlertTriangle,   label: "Late Penalty",      value: latePenalty                 ?? 0, accent: true },
  ];

  const subtotal = rows.reduce((s, r) => s + r.value, 0);

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1 text-brand-600 hover:text-brand-800
                   text-xs font-semibold underline underline-offset-2 decoration-dashed
                   transition-colors duration-150 focus:outline-none"
      >
        View Details
        <ChevronDown size={12} className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          className="absolute z-50 left-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl
                     border border-gray-100 overflow-hidden"
          style={{ animation: "fadeUp 0.15s ease-out both" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
            <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">
              Charge Breakdown
            </p>
            <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X size={13} />
            </button>
          </div>

          {/* Rows */}
          <div className="px-4 py-3 space-y-2.5">
            {rows.map(({ icon: Icon, label, value, accent }) => (
              <div key={label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon size={12} className={accent ? "text-red-400" : "text-brand-400"} />
                  <span className={`text-xs font-medium ${accent ? "text-red-600" : "text-gray-600"}`}>{label}</span>
                </div>
                <span className={`text-xs font-bold ${accent && value > 0 ? "text-red-600" : "text-gray-800"}`}>
                  {fmt(value)}
                </span>
              </div>
            ))}
          </div>

          {/* Subtotal */}
          <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs font-bold text-gray-700">Sub-total</span>
            <span className="text-xs font-bold text-brand-700">{fmt(subtotal)}</span>
          </div>
        </div>
      )}
    </div>
  );
};

import { downloadInvoice } from "../../../utils/generateInvoice";

// ── PDF Download ──────────────────────────────────────────────────────────────

const handleDownloadPdf = (inst, unitDetails) => {
  try {
    downloadInvoice(inst, unitDetails || {});
  } catch (error) {
    console.error("Error generating invoice:", error);
    alert("There was an error generating the invoice PDF.");
  }
};

// ── Summary Bar ───────────────────────────────────────────────────────────────

const SummaryBar = ({ installments }) => {
  const paid    = installments.filter((i) => i.status === "Paid").length;
  const pending = installments.filter((i) => i.status === "Pending").length;
  const unpaid  = installments.filter((i) => i.status === "Unpaid").length;
  const overdue = installments.filter((i) => i.status === "Overdue").length;
  const totalPaid = installments
    .filter((i) => i.status === "Paid")
    .reduce((s, i) => s + (i.totalAmount ?? 0), 0);

  return (
    <div className="flex flex-wrap items-center gap-2 mb-5">
      {[
        { label: "Total",   v: installments.length, cls: "text-gray-700 bg-gray-50 ring-gray-200" },
        { label: "Paid",    v: paid,                 cls: "text-emerald-700 bg-emerald-50 ring-emerald-200" },
        { label: "Pending", v: pending,              cls: "text-amber-700 bg-amber-50 ring-amber-200" },
        { label: "Unpaid",  v: unpaid,               cls: "text-gray-700 bg-gray-100 ring-gray-300" },
        { label: "Overdue", v: overdue,              cls: "text-red-700 bg-red-50 ring-red-200" },
      ].map(({ label, v, cls }) => (
        <span key={label} className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ring-1 ${cls}`}>
          {label}: {v}
        </span>
      ))}
      <span className="ml-auto text-xs text-gray-500">
        Paid: <span className="font-bold text-emerald-700">{fmt(totalPaid)}</span>
      </span>
    </div>
  );
};

// ── Skeleton ──────────────────────────────────────────────────────────────────

const Skeleton = () => (
  <div className="animate-pulse space-y-2">
    <div className="h-10 bg-gray-100 rounded-xl" />
    {[...Array(4)].map((_, i) => <div key={i} className="h-12 bg-gray-50 rounded-xl" />)}
  </div>
);

// ── Empty ─────────────────────────────────────────────────────────────────────

const Empty = () => (
  <div className="flex flex-col items-center justify-center py-14 text-center">
    <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mb-4">
      <ReceiptText size={26} className="text-gray-300" />
    </div>
    <p className="text-sm font-semibold text-gray-600">No installments yet</p>
    <p className="text-xs text-gray-400 mt-1 max-w-xs">
      Installments appear once the accountant processes your document.
    </p>
  </div>
);

// ── Main ──────────────────────────────────────────────────────────────────────

const InstallmentTable = ({ unitId, unitDetails }) => {
  const [installments, setInstallments] = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState(null);
  
  const [uploadingId,  setUploadingId]  = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [activeInstallmentName, setActiveInstallmentName] = useState("");

  const load = useCallback(async () => {
    if (!unitId) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get(`/api/customer/installments/${unitId}`, {
        withCredentials: true,
      });
      setInstallments(data.installments ?? []);
    } catch (err) {
      setError(err?.response?.data?.message ?? "Failed to load installments.");
    } finally {
      setLoading(false);
    }
  }, [unitId]);

  useEffect(() => { load(); }, [load]);

  const handlePayClick = (inst) => {
    setUploadingId(inst._id);
    setActiveInstallmentName(inst.installmentName);
    setUploadModalOpen(true);
  };

  const handlePaymentSubmit = async ({ bankName, accountNumber, file }) => {
    setUploadLoading(true);
    try {
      const formData = new FormData();
      formData.append("bankName", bankName);
      formData.append("accountNumber", accountNumber);
      formData.append("invoice", file);

      const { data } = await axios.put(`/api/customer/installments/${uploadingId}/pay`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      import("react-hot-toast").then((toast) => toast.default.success(data.message || "Payment proof submitted successfully"));
      setUploadModalOpen(false);
      load();
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to submit payment proof.";
      import("react-hot-toast").then((toast) => toast.default.error(msg));
    } finally {
      setUploadLoading(false);
    }
  };

  // ── Guards ──────────────────────────────────────────────────────────────────
  if (!unitId)        return <div className="text-sm text-amber-600 flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3"><AlertCircle size={14} /> Unit ID missing.</div>;
  if (loading)        return <Skeleton />;
  if (error)          return (
    <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
      <AlertCircle size={14} /> {error}
      <button onClick={load} className="ml-auto text-xs font-semibold underline">Retry</button>
    </div>
  );
  if (!installments.length) return <Empty />;

  // ── Table ───────────────────────────────────────────────────────────────────
  return (
    <div>
      <SummaryBar installments={installments} />

      <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
        <table className="w-full text-sm min-w-[680px]">

          {/* Head */}
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {["Invoice", "Installment", "Charge", "Invoice Date", "Due Date", "Total", "Status"].map((col) => (
                <th
                  key={col}
                  className="px-4 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody className="divide-y divide-gray-50">
            {installments.map((inst) => (
              <tr
                key={inst._id}
                className={`transition-colors duration-150 ${
                  inst.status === "Overdue"
                    ? "bg-red-50/50 hover:bg-red-50"
                    : "bg-white hover:bg-gray-50/70"
                }`}
              >
                {/* Invoice / PDF */}
                <td className="px-4 py-3.5 whitespace-nowrap">
                  {inst.status === "Paid" ? (
                    <button
                      onClick={() => handleDownloadPdf(inst, unitDetails)}
                      title="Download Invoice PDF"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg
                                 bg-brand-50 text-brand-600 hover:bg-brand-100
                                 text-xs font-semibold transition-all duration-150 border border-brand-100"
                    >
                      <FileDown size={12} />
                      PDF
                    </button>
                  ) : (
                    <span className="text-xs text-gray-350 font-medium">N/A</span>
                  )}
                </td>

                {/* Installment name */}
                <td className="px-4 py-3.5 max-w-[160px]">
                  <span className="font-semibold text-gray-800 text-xs leading-snug line-clamp-2">
                    {inst.installmentName}
                  </span>
                </td>

                {/* Charge breakdown (interactive) */}
                <td className="px-4 py-3.5">
                  <ChargePopover breakdown={inst.chargeBreakdown} latePenalty={inst.latePenalty} />
                </td>

                {/* Invoice date */}
                <td className="px-4 py-3.5 text-xs text-gray-500 whitespace-nowrap">
                  {fmtDate(inst.invoiceDate)}
                </td>

                {/* Due date */}
                <td className="px-4 py-3.5 whitespace-nowrap">
                  <span className={`text-xs font-medium ${inst.status === "Overdue" ? "text-red-600 font-semibold" : "text-gray-500"}`}>
                    {fmtDate(inst.dueDate)}
                  </span>
                </td>

                {/* Total */}
                <td className="px-4 py-3.5 whitespace-nowrap">
                  <span className="font-bold text-gray-900 text-xs sm:text-sm">{fmt(inst.totalAmount)}</span>
                  {(inst.latePenalty ?? 0) > 0 && (
                    <span className="block text-[10px] text-red-500 font-medium mt-0.5">
                      + ৳{Number(inst.latePenalty).toLocaleString("en-BD")} penalty
                    </span>
                  )}
                </td>

                {/* Status */}
                <td className="px-4 py-3.5 whitespace-nowrap">
                  <StatusBadge status={inst.status} onClick={() => handlePayClick(inst)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-[11px] text-gray-400 mt-3 text-right">
        {installments.length} record{installments.length !== 1 ? "s" : ""} · values in BDT (৳)
      </p>

      <PaymentModal 
        open={uploadModalOpen} 
        onClose={() => setUploadModalOpen(false)} 
        onSubmit={handlePaymentSubmit}
        loading={uploadLoading}
        installmentName={activeInstallmentName}
      />
    </div>
  );
};

export default InstallmentTable;
