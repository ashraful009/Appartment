import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { Sparkles, ArrowRight, Building2, X } from "lucide-react";
import { fmtTk } from "./fmt";

const BOOKING_MONEY = 20000;

/**
 * Shown to a logged-in user who wants to invest in a new property.
 * Fetches available properties (Ongoing / Upcoming) and lets the user
 * select one before sending them to the shared payment page.
 */
const BookingCTA = ({ onSubmitted, onCancel }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const { data } = await axios.get(
          "/api/properties/public?noPaginate=true&status=Ongoing",
          { withCredentials: true }
        );
        // Also fetch Upcoming
        const { data: upcoming } = await axios.get(
          "/api/properties/public?noPaginate=true&status=Upcoming",
          { withCredentials: true }
        );
        const all = [
          ...(data.properties || []),
          ...(upcoming.properties || []),
        ];
        setProperties(all);
      } catch {
        setProperties([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  const selected = properties.find((p) => p._id === selectedId);

  const goPay = () => {
    if (!selectedId) return;
    navigate("/membership/pay", {
      state: {
        kind: "booking",
        total: BOOKING_MONEY,
        propertyId: selectedId,
        propertyName: selected?.name || "",
        returnTo: location.pathname,
      },
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8 max-w-2xl mx-auto">
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center">
            <Sparkles className="text-brand-600" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-gray-900">Invest in a Property</h2>
            <p className="text-gray-500 text-sm">
              Pay {fmtTk(BOOKING_MONEY)} booking money to start your investment journey.
            </p>
          </div>
        </div>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Property Selection */}
      <div className="mb-5">
        <label className="block text-xs font-bold text-gray-700 mb-2">
          Select Property <span className="text-red-500">*</span>
        </label>

        {loading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : properties.length === 0 ? (
          <div className="bg-gray-50 rounded-xl p-4 text-center text-gray-400 text-sm">
            No properties available for investment right now.
          </div>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {properties.map((p) => (
              <button
                key={p._id}
                type="button"
                onClick={() => setSelectedId(p._id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                  selectedId === p._id
                    ? "border-brand-500 bg-brand-50 ring-2 ring-brand-500/20"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <div className="w-12 h-12 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                  {p.mainImage ? (
                    <img
                      src={p.mainImage}
                      alt={p.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Building2 size={18} className="text-gray-300" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-800 truncate">{p.name}</p>
                  <p className="text-xs text-gray-400 truncate">{p.address}</p>
                </div>
                <span
                  className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                    p.status === "Ongoing"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-blue-50 text-blue-700 border-blue-200"
                  }`}
                >
                  {p.status}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={goPay}
        disabled={!selectedId}
        className="w-full py-3 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Pay Booking Money ({fmtTk(BOOKING_MONEY)}) <ArrowRight size={16} />
      </button>
    </div>
  );
};

export default BookingCTA;
