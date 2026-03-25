import React from "react";

/**
 * PaymentProgressBar — sleek progress bar for installment completion.
 * Props:
 *   totalInstallments {number}
 *   paidInstallments  {number}
 */
const PaymentProgressBar = ({ totalInstallments = 0, paidInstallments = 0 }) => {
  const safeTotal = Math.max(totalInstallments, 1);
  const safePaid  = Math.min(paidInstallments, safeTotal);
  const pct       = Math.round((safePaid / safeTotal) * 100);

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-xs font-semibold text-gray-600">
          Payment Progress
        </p>
        <span className="text-xs font-bold text-brand-600">{pct}%</span>
      </div>

      {/* Track */}
      <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand-500 to-emerald-400 transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>

      <p className="text-[11px] text-gray-400 mt-1">
        <span className="font-semibold text-gray-600">{safePaid}</span> of{" "}
        <span className="font-semibold text-gray-600">{totalInstallments}</span>{" "}
        installments paid
      </p>
    </div>
  );
};

export default PaymentProgressBar;
