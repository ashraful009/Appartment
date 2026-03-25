import React from "react";
import { Download } from "lucide-react";

// Status → badge style
const STATUS_BADGE = {
  Paid:    "bg-emerald-100 text-emerald-700 border-emerald-200",
  Pending: "bg-gray-100 text-gray-500 border-gray-200",
  Overdue: "bg-red-100 text-red-700 border-red-200",
};

const formatDate = (date) =>
  date
    ? new Intl.DateTimeFormat("en-US", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(date))
    : "—";

const formatAmount = (amount) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "BDT", maximumFractionDigits: 0 })
    .format(amount ?? 0);

/**
 * InstallmentTable — renders a clean table of all installments.
 * Props: installments {Array}
 */
const InstallmentTable = ({ installments = [] }) => {
  if (installments.length === 0) {
    return (
      <p className="text-sm text-gray-400 italic py-4 text-center">
        No installment schedule found.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-100">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-xs uppercase tracking-widest text-gray-400 border-b border-gray-100">
          <tr>
            <th className="px-4 py-2.5 text-left font-semibold">#</th>
            <th className="px-4 py-2.5 text-left font-semibold">Due Date</th>
            <th className="px-4 py-2.5 text-left font-semibold">Amount</th>
            <th className="px-4 py-2.5 text-left font-semibold">Status</th>
            <th className="px-4 py-2.5 text-left font-semibold">Receipt</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {installments.map((inst, i) => (
            <tr key={i} className="hover:bg-gray-50/60 transition-colors">
              {/* Number */}
              <td className="px-4 py-2.5 text-gray-400 font-mono text-xs">
                {String(inst.installmentNumber ?? i + 1).padStart(2, "0")}
              </td>

              {/* Due Date */}
              <td className="px-4 py-2.5 text-gray-700 whitespace-nowrap">
                {formatDate(inst.dueDate)}
              </td>

              {/* Amount */}
              <td className="px-4 py-2.5 font-semibold text-gray-800 whitespace-nowrap">
                {formatAmount(inst.amount)}
              </td>

              {/* Status badge */}
              <td className="px-4 py-2.5">
                <span
                  className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                    STATUS_BADGE[inst.status] ?? STATUS_BADGE.Pending
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current inline-block" />
                  {inst.status}
                </span>
              </td>

              {/* Receipt button — only enabled for paid installments with a receiptUrl */}
              <td className="px-4 py-2.5">
                {inst.status === "Paid" && inst.receiptUrl ? (
                  <a
                    href={inst.receiptUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-800 hover:underline transition-colors"
                  >
                    <Download size={12} />
                    Download
                  </a>
                ) : (
                  <button
                    disabled
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-300 cursor-not-allowed"
                  >
                    <Download size={12} />
                    Download
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InstallmentTable;
