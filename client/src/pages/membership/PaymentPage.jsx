import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import {
  ArrowLeft,
  Smartphone,
  Landmark,
  Banknote,
  UploadCloud,
  ReceiptText,
} from "lucide-react";
import { fmtTk } from "../../components/investment/fmt";
import { MFS_PROVIDERS, BD_BANKS } from "../../components/investment/paymentConstants";

const KIND_LABEL = {
  booking: "Booking Money",
  downpayment: "Down Payment",
  installment: "Installment Payment",
};

const METHODS = [
  { key: "MFS", label: "Mobile Banking", icon: Smartphone, hint: "Bikash, Nagad, Rocket, Upay" },
  { key: "Bank", label: "Bank Transfer", icon: Landmark, hint: "Any Bangladeshi bank" },
  { key: "Cash", label: "Cash", icon: Banknote, hint: "Paid in cash at office" },
];

const Field = ({ label, required, children }) => (
  <div>
    <label className="block text-xs font-bold text-gray-700 mb-1.5">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
  </div>
);

const inputCls =
  "w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500";

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state || {};
  const {
    kind,
    installmentIds = [],
    amount,
    total = 0,
    returnTo = "/membership",
    count,
    propertyId,
    membershipId,
  } = state;

  const [method, setMethod] = useState("");
  const [provider, setProvider] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [holderName, setHolderName] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // No valid context (e.g. page refresh) → back to the journey.
  if (!kind) return <Navigate to="/membership" replace />;

  const submit = async () => {
    if (!method) return toast.error("Select a payment method.");
    if (method === "MFS") {
      if (!provider) return toast.error("Select an MFS provider.");
      if (!mobileNumber.trim()) return toast.error("Enter the MFS mobile number.");
      if (!transactionId.trim()) return toast.error("Enter the transaction ID.");
    }
    if (method === "Bank") {
      if (!bankName) return toast.error("Select a bank.");
      if (!accountNumber.trim()) return toast.error("Enter the account number.");
      if (!transactionId.trim()) return toast.error("Enter the transaction ID.");
    }
    if (!file) return toast.error("Attach the payment invoice (image or PDF).");

    const fd = new FormData();
    fd.append("paymentMethod", method);
    if (method === "MFS") {
      fd.append("provider", provider);
      fd.append("mobileNumber", mobileNumber);
      fd.append("transactionId", transactionId);
    } else if (method === "Bank") {
      fd.append("bankName", bankName);
      fd.append("accountNumber", accountNumber);
      fd.append("holderName", holderName);
      fd.append("transactionId", transactionId);
    }
    fd.append("invoice", file);
    if (description) fd.append("description", description);

    let url = "";
    if (kind === "booking") {
      url = "/api/membership/booking";
      if (propertyId) fd.append("propertyId", propertyId);
    } else if (kind === "downpayment") {
      url = "/api/membership/downpayment";
      fd.append("amount", amount);
      if (membershipId) fd.append("membershipId", membershipId);
    } else if (kind === "installment") {
      url = "/api/membership/installments/pay";
      installmentIds.forEach((id) => fd.append("installmentIds[]", id));
      if (membershipId) fd.append("membershipId", membershipId);
    }

    setLoading(true);
    try {
      const { data } = await axios.post(url, fd, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      toast.success(data.message || "Payment submitted. Awaiting confirmation.");
      navigate(returnTo, { replace: true });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to submit payment.");
    } finally {
      setLoading(false);
    }
  };

  const summaryLabel =
    kind === "installment" && count
      ? `${count} installment(s)`
      : KIND_LABEL[kind] || "Payment";

  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto">
      <button
        onClick={() => navigate(returnTo)}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4"
      >
        <ArrowLeft size={15} /> Back
      </button>

      {/* Summary */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-brand-50 flex items-center justify-center">
            <ReceiptText className="text-brand-600" size={22} />
          </div>
          <div className="flex-1">
            <h1 className="text-lg font-extrabold text-gray-900">{KIND_LABEL[kind]}</h1>
            <p className="text-sm text-gray-500">{summaryLabel}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400 uppercase font-semibold">Total</p>
            <p className="text-xl font-extrabold text-brand-700">{fmtTk(total)}</p>
          </div>
        </div>
      </div>

      {/* Method picker */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
        <div>
          <p className="text-xs font-bold text-gray-700 mb-2">Payment Method</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {METHODS.map(({ key, label, icon: Icon, hint }) => (
              <button
                key={key}
                type="button"
                onClick={() => setMethod(key)}
                className={`flex flex-col items-start gap-1 p-4 rounded-xl border text-left transition-all ${
                  method === key
                    ? "border-brand-500 bg-brand-50 ring-2 ring-brand-500/20"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <Icon size={20} className={method === key ? "text-brand-600" : "text-gray-400"} />
                <span className="text-sm font-bold text-gray-800">{label}</span>
                <span className="text-[11px] text-gray-400">{hint}</span>
              </button>
            ))}
          </div>
        </div>

        {/* MFS fields */}
        {method === "MFS" && (
          <div className="space-y-4 border-t border-gray-100 pt-4">
            <Field label="MFS Provider" required>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {MFS_PROVIDERS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setProvider(p)}
                    className={`py-2 rounded-lg text-sm font-semibold border transition-colors ${
                      provider === p
                        ? "bg-brand-600 text-white border-brand-600"
                        : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Sender Mobile Number" required>
              <input
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                placeholder="01XXXXXXXXX"
                className={inputCls}
              />
            </Field>
            <Field label="Transaction ID" required>
              <input
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="e.g. 8N7A6B5C4D"
                className={inputCls}
              />
            </Field>
          </div>
        )}

        {/* Bank fields */}
        {method === "Bank" && (
          <div className="space-y-4 border-t border-gray-100 pt-4">
            <Field label="Bank" required>
              <select value={bankName} onChange={(e) => setBankName(e.target.value)} className={inputCls}>
                <option value="">Select a bank…</option>
                {BD_BANKS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Account Number" required>
              <input
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="Account number"
                className={inputCls}
              />
            </Field>
            <Field label="Account Holder Name">
              <input
                value={holderName}
                onChange={(e) => setHolderName(e.target.value)}
                placeholder="Name on the account"
                className={inputCls}
              />
            </Field>
            <Field label="Transaction ID / Reference" required>
              <input
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="Bank reference number"
                className={inputCls}
              />
            </Field>
          </div>
        )}

        {/* Cash note */}
        {method === "Cash" && (
          <div className="border-t border-gray-100 pt-4">
            <div className="bg-amber-50 border border-amber-200 text-amber-700 rounded-xl px-4 py-3 text-sm">
              For cash payments, upload a photo/scan of your money receipt below.
            </div>
          </div>
        )}

        {/* Invoice + description (all methods) */}
        {method && (
          <div className="space-y-4 border-t border-gray-100 pt-4">
            <Field label="Invoice / Receipt (Image or PDF)" required>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.webp,.pdf"
                onChange={(e) => setFile(e.target.files[0])}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 cursor-pointer border border-gray-200 rounded-xl bg-gray-50"
              />
            </Field>
            <Field label="Description (optional)">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="Any note for the accountant…"
                className={inputCls}
              />
            </Field>
            <button
              onClick={submit}
              disabled={loading}
              className="w-full py-3 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <UploadCloud size={16} /> Submit Payment
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentPage;
