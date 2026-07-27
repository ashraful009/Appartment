import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import PaymentProgressBar from "./PaymentProgressBar";

const FALLBACK_IMG = "https://placehold.co/80x60/e2e8f0/94a3b8?text=No+Image";

const STATUS_CLASSES = {
  Paid:    "bg-emerald-50 text-emerald-700 border-emerald-200",
  Overdue: "bg-red-50 text-red-700 border-red-200",
  Pending: "bg-amber-50 text-amber-700 border-amber-200",
};


const PaymentPlanCard = ({ plan }) => {
  const [expanded, setExpanded] = useState(false);

  const property        = plan?.propertyId;
  const installments    = plan?.installments ?? [];
  const paidCount       = installments.filter((i) => i.status === "Paid").length;
  const overdueCount    = installments.filter((i) => i.status === "Overdue").length;

  const formatCurrency = (n) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "BDT", maximumFractionDigits: 0 }).format(n ?? 0);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      
      <div className="flex items-center gap-4 p-5 border-b border-gray-50">
        <img
          src={property?.mainImage || FALLBACK_IMG}
          alt={property?.name || "Property"}
          className="w-20 h-16 object-cover rounded-xl flex-shrink-0"
          onError={(e) => { e.target.src = FALLBACK_IMG; }}
        />
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold text-gray-900 truncate">
            {property?.name ?? "Unknown Property"}
          </h3>
          <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-500">
            <span>Total: <strong className="text-gray-800">{formatCurrency(plan.totalPrice)}</strong></span>
            <span>Booking: <strong className="text-gray-800">{formatCurrency(plan.bookingMoney)}</strong></span>
            {overdueCount > 0 && (
              <span className="text-red-600 font-semibold"> {overdueCount} Overdue</span>
            )}
          </div>
        </div>
      </div>

      
      <div className="px-5 pt-4">
        <PaymentProgressBar
          totalInstallments={plan.totalInstallments}
          paidInstallments={paidCount}
        />
      </div>

      
      <button
        onClick={() => setExpanded((prev) => !prev)}
        className="w-full flex items-center justify-between px-5 py-3 text-xs font-semibold text-gray-500 hover:text-brand-600 hover:bg-gray-50 transition-colors border-t border-gray-100"
      >
        <span>{expanded ? "Hide" : "View"} Installment Schedule</span>
        {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
      </button>

      
      {expanded && (
        <div className="px-5 pb-5">
          {installments.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">No installments scheduled yet.</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-100">
              <table className="w-full text-sm min-w-[420px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-[11px] uppercase tracking-wider text-gray-500">
                    <th className="px-4 py-2.5 text-left font-bold">#</th>
                    <th className="px-4 py-2.5 text-left font-bold">Amount</th>
                    <th className="px-4 py-2.5 text-left font-bold">Due Date</th>
                    <th className="px-4 py-2.5 text-left font-bold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {installments.map((inst) => (
                    <tr key={inst.installmentNumber} className="border-b border-gray-50 last:border-0">
                      <td className="px-4 py-2.5 font-semibold text-gray-700">{inst.installmentNumber}</td>
                      <td className="px-4 py-2.5 text-gray-800">{formatCurrency(inst.amount)}</td>
                      <td className="px-4 py-2.5 text-gray-600">
                        {inst.dueDate ? new Date(inst.dueDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                      </td>
                      <td className="px-4 py-2.5">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${STATUS_CLASSES[inst.status] || STATUS_CLASSES.Pending}`}>
                          {inst.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PaymentPlanCard;
