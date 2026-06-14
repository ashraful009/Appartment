import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { X, Mail, Phone, CheckCircle2, CalendarClock } from "lucide-react";
import { fmtTk, fmtDate } from "../investment/fmt";

const Stat = ({ label, value, accent }) => (
  <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
    <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
    <p className={`text-lg font-extrabold ${accent || "text-gray-900"}`}>{value}</p>
  </div>
);

/**
 * Shared member-profile modal. Fetches `${basePath}/members/:userId` so it works
 * for any staff panel (accountant / data-entry / management).
 */
const MemberProfileModal = ({ basePath, userId, onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(`${basePath}/members/${userId}`, {
          withCredentials: true,
        });
        setData(data);
      } catch (err) {
        toast.error(err?.response?.data?.message || "Failed to load profile.");
        onClose();
      } finally {
        setLoading(false);
      }
    })();
  }, [basePath, userId, onClose]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50 sticky top-0">
          <h3 className="font-extrabold text-gray-900 text-lg">Member Profile</h3>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg">
            <X size={18} />
          </button>
        </div>

        {loading || !data ? (
          <div className="p-6 space-y-3">
            <div className="h-16 bg-gray-100 rounded-xl animate-pulse" />
            <div className="grid grid-cols-2 gap-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          </div>
        ) : (
          <div className="p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-lg">
                {data.membership.userId?.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <p className="font-extrabold text-gray-900">{data.membership.userId?.name}</p>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Mail size={12} /> {data.membership.userId?.email}
                </p>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Phone size={12} /> {data.membership.userId?.phone}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Stat label="Total Invested" value={fmtTk(data.stats.totalApprovedPaid)} accent="text-brand-700" />
              <Stat label="Shares" value={data.stats.shares} />
              <Stat label="Properties Bought" value={data.stats.propertiesBought} />
              <Stat label="Installments Paid" value={data.stats.installmentsPaidCount} />
              <Stat label="Installments Remaining" value={data.stats.installmentsRemaining} />
              <Stat
                label="Overdue"
                value={data.stats.overdueCount}
                accent={data.stats.overdueCount > 0 ? "text-red-600" : "text-gray-900"}
              />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <CheckCircle2 size={15} className="text-emerald-500" />
                Last payment: <span className="font-semibold text-gray-800">{fmtDate(data.stats.lastPaymentDate)}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <CalendarClock size={15} className="text-amber-500" />
                Next due: <span className="font-semibold text-gray-800">{fmtDate(data.stats.nextDueDate)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberProfileModal;
