import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { Activity, AlertCircle, FileText, Check, Clock } from "lucide-react";

const fmtTk = (n) => `৳ ${Number(n || 0).toLocaleString("en-BD")}`;
const fmtDateTime = (d) =>
  d
    ? new Date(d).toLocaleString("en-GB", {
        day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
      })
    : null;

const TYPE_LABEL = { booking: "Booking Money", downpayment: "Down Payment", installment: "Installment" };

const STAGE_PILL = {
  Pending:             "bg-amber-50 text-amber-700 border-amber-200",
  AccountantConfirmed: "bg-blue-50 text-blue-700 border-blue-200",
  DataEntryConfirmed:  "bg-indigo-50 text-indigo-700 border-indigo-200",
  Paid:                "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const FILTERS = [
  { key: "", label: "All" },
  { key: "Pending", label: "At Accountant" },
  { key: "AccountantConfirmed", label: "At Data Entry" },
  { key: "DataEntryConfirmed", label: "At Management" },
  { key: "Paid", label: "Completed" },
];


const StageCell = ({ stage }) => {
  if (!stage?.by) {
    return (
      <span className="inline-flex items-center gap-1 text-gray-300 text-xs">
        <Clock size={12} /> —
      </span>
    );
  }
  return (
    <div className="text-xs">
      <p className="font-semibold text-gray-800 flex items-center gap-1">
        <Check size={12} className="text-emerald-500" /> {stage.by.name}
      </p>
      <p className="text-gray-400">{fmtDateTime(stage.at)}</p>
    </div>
  );
};

const PaymentTracking = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await axios.get(
        `/api/admin/payment-tracking${filter ? `?status=${filter}` : ""}`,
        { withCredentials: true }
      );
      setRows(data);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load payment tracking.");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="p-8 space-y-6">

      <div className="flex flex-wrap gap-2 mb-5">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
              filter === f.key
                ? "bg-brand-600 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-5 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          <AlertCircle size={15} /> {error}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[920px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {["User", "Property", "Payment", "Stage", "Accountant", "Data Entry", "Management", "Proof"].map((c) => (
                  <th key={c} className="text-left px-5 py-3.5 font-semibold text-gray-600 whitespace-nowrap">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={8} className="px-5 py-4">
                      <div className="h-8 bg-gray-100 rounded-lg animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-14 text-gray-400">
                    No payments in the pipeline.
                  </td>
                </tr>
              ) : (
                rows.map((e) => (
                  <tr key={e._id} className="hover:bg-gray-50/70 align-top">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-gray-800">{e.userId?.name}</p>
                      <p className="text-xs text-gray-400">{e.userId?.email}</p>
                    </td>
                    <td className="px-5 py-4">
                      {e.propertyId ? (
                        <div className="flex items-center gap-2">
                          {e.propertyId.mainImage && (
                            <img
                              src={e.propertyId.mainImage}
                              alt={e.propertyId.name}
                              className="w-10 h-7 object-cover rounded flex-shrink-0"
                            />
                          )}
                          <p className="font-semibold text-gray-800 text-xs truncate max-w-[150px]" title={e.propertyId.name}>
                            {e.propertyId.name}
                          </p>
                        </div>
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-gray-800">
                        {TYPE_LABEL[e.type]}
                        {e.type === "installment" && (
                          <span className="text-gray-400 font-normal"> #{e.installmentNumber}</span>
                        )}
                      </p>
                      <p className="text-xs text-brand-700 font-bold">{fmtTk(e.amount)}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`px-2.5 py-1 text-[11px] font-bold rounded-full border ${
                          STAGE_PILL[e.status] || "bg-gray-100 text-gray-600 border-gray-200"
                        }`}
                      >
                        {e.stageLabel || e.status}
                      </span>
                    </td>
                    <td className="px-5 py-4"><StageCell stage={e.audit?.accountant} /></td>
                    <td className="px-5 py-4"><StageCell stage={e.audit?.dataEntry} /></td>
                    <td className="px-5 py-4"><StageCell stage={e.audit?.management} /></td>
                    <td className="px-5 py-4">
                      {e.invoiceUrl ? (
                        <a
                          href={e.invoiceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-brand-600 hover:text-brand-800 text-xs font-semibold"
                        >
                          <FileText size={13} /> View
                        </a>
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PaymentTracking;
