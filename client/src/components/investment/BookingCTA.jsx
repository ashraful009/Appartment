import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Sparkles, ArrowRight } from "lucide-react";
import { fmtTk } from "./fmt";

const BOOKING_MONEY = 20000;

/**
 * Shown to a logged-in user who has no membership yet. Sends them to the shared
 * payment page to pay the ৳20,000 booking money (method + invoice captured there).
 */
const BookingCTA = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const goPay = () =>
    navigate("/membership/pay", {
      state: { kind: "booking", total: BOOKING_MONEY, returnTo: location.pathname },
    });

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 max-w-xl mx-auto text-center">
      <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center mx-auto mb-4">
        <Sparkles className="text-brand-600" size={26} />
      </div>
      <h2 className="text-xl font-extrabold text-gray-900">Become a Member</h2>
      <p className="text-gray-500 text-sm mt-2">
        Pay the booking money of <strong>{fmtTk(BOOKING_MONEY)}</strong> to start your
        investment journey toward {fmtTk(5000000)}. Once an accountant confirms and an admin
        approves your payment, you become a member.
      </p>

      <button
        onClick={goPay}
        className="mt-6 w-full py-3 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 transition-colors flex items-center justify-center gap-2"
      >
        Pay Booking Money <ArrowRight size={16} />
      </button>
    </div>
  );
};

export default BookingCTA;
