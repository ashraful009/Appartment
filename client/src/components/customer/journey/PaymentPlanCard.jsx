import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import PaymentProgressBar from "./PaymentProgressBar";
import InstallmentTable from "./InstallmentTable";

const FALLBACK_IMG = "https://placehold.co/80x60/e2e8f0/94a3b8?text=No+Image";

/**
 * PaymentPlanCard — shows a payment plan summary with a collapsible installment table.
 * Props: plan {object}  — populated PaymentPlan document
 */
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
      {/* ── Card Header ─────────────────────────────────────────────── */}
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
              <span className="text-red-600 font-semibold">⚠ {overdueCount} Overdue</span>
            )}
          </div>
        </div>
      </div>

      {/* ── Progress Bar ─────────────────────────────────────────────── */}
      <div className="px-5 pt-4">
        <PaymentProgressBar
          totalInstallments={plan.totalInstallments}
          paidInstallments={paidCount}
        />
      </div>

      {/* ── Accordion Toggle ─────────────────────────────────────────── */}
      <button
        onClick={() => setExpanded((prev) => !prev)}
        className="w-full flex items-center justify-between px-5 py-3 text-xs font-semibold text-gray-500 hover:text-brand-600 hover:bg-gray-50 transition-colors border-t border-gray-100"
      >
        <span>{expanded ? "Hide" : "View"} Installment Schedule</span>
        {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
      </button>

      {/* ── Collapsible Installment Table ────────────────────────────── */}
      {expanded && (
        <div className="px-5 pb-5">
          <InstallmentTable installments={installments} />
        </div>
      )}
    </div>
  );
};

export default PaymentPlanCard;
