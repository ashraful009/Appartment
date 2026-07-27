import React, { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useLocation } from "react-router-dom";
import { Landmark, ArrowRight } from "lucide-react";
import { fmtTk } from "./fmt";

const DOWNPAYMENT_TARGET = 500000;


const DownPaymentCTA = ({ membership, pending }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [amount, setAmount] = useState(DOWNPAYMENT_TARGET);

  const goPay = () => {
    if (Number(amount) < DOWNPAYMENT_TARGET)
      return toast.error(`Down payment must be at least ${fmtTk(DOWNPAYMENT_TARGET)}.`);
    navigate("/membership/pay", {
      state: {
        kind: "downpayment",
        amount: Number(amount),
        total: Number(amount),
        membershipId: membership._id,
        returnTo: location.pathname,
      },
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-11 h-11 rounded-2xl bg-brand-50 flex items-center justify-center">
          <Landmark className="text-brand-600" size={22} />
        </div>
        <div>
          <h2 className="text-lg font-extrabold text-gray-900">Complete Down Payment</h2>
          <p className="text-gray-500 text-sm">
            Pay at least {fmtTk(DOWNPAYMENT_TARGET)} to become an investor.
          </p>
        </div>
      </div>

      {pending ? (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 rounded-xl px-4 py-3 text-sm">
          Your down payment of <strong>{fmtTk(membership.downPaymentAmount)}</strong> is
          submitted and awaiting confirmation.
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Down Payment Amount (≥ {fmtTk(DOWNPAYMENT_TARGET)})
            </label>
            <input
              type="number"
              min={DOWNPAYMENT_TARGET}
              step={1000}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-semibold"
            />
            <p className="text-[11px] text-gray-400 mt-1.5">
              Cash to collect now: <strong>{fmtTk(amount)}</strong>. Remaining target will be split into two ৳5,00,000 installments, and the rest into ৳25,000 monthly installments.
            </p>
          </div>
          <button
            onClick={goPay}
            className="w-full py-3 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 transition-colors flex items-center justify-center gap-2"
          >
            Continue to Payment <ArrowRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default DownPaymentCTA;
