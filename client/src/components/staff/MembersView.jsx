import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Users, AlertTriangle } from "lucide-react";
import { fmtTk, fmtDate } from "../investment/fmt";
import MemberProfileModal from "./MemberProfileModal";

const STATUS_PILL = {
  member: "bg-rose-50 text-rose-700 border-rose-200",
  investor: "bg-cyan-50 text-cyan-700 border-cyan-200",
};


const MembersView = ({ basePath, title = "Members", subtitle }) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openUser, setOpenUser] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${basePath}/members`, { withCredentials: true });
      setRows(data);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load members.");
    } finally {
      setLoading(false);
    }
  }, [basePath]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-2xl bg-brand-600 flex items-center justify-center">
          <Users size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">{title}</h1>
          <p className="text-sm text-gray-500">
            {subtitle || "Who paid when, and who is overdue. Click a card for the full profile."}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-40 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center text-gray-400">
          No members yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rows.map((m) => (
            <button
              key={m._id}
              onClick={() => setOpenUser(m._id)}
              className="text-left bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-5"
            >
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold shrink-0">
                    {m.userId?.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 truncate">{m.userId?.name}</p>
                    <p className="text-xs text-gray-400 truncate">{m.userId?.email}</p>
                  </div>
                </div>
                <span
                  className={`px-2 py-0.5 text-[10px] font-bold rounded-full border capitalize ${
                    STATUS_PILL[m.status] || "bg-gray-100 text-gray-500 border-gray-200"
                  }`}
                >
                  {m.status}
                </span>
              </div>

              {m.overdueCount > 0 && (
                <div className="mb-3 inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 text-red-700 rounded-lg text-xs font-bold">
                  <AlertTriangle size={13} /> {m.overdueCount} overdue installment(s)
                </div>
              )}

              {m.propertyId && (
                <div className="mb-3 flex items-center gap-2 p-2 bg-gray-50 border border-gray-100 rounded-xl">
                  {m.propertyId.mainImage && (
                    <img
                      src={m.propertyId.mainImage}
                      alt={m.propertyId.name}
                      className="w-8 h-8 rounded object-cover flex-shrink-0"
                    />
                  )}
                  <div className="min-w-0">
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">Property</p>
                    <p className="text-xs font-bold text-gray-800 truncate leading-tight">{m.propertyId.name}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-gray-400">Invested</p>
                  <p className="font-bold text-gray-800">{fmtTk(m.totalApprovedPaid)}</p>
                </div>
                <div>
                  <p className="text-gray-400">Installments</p>
                  <p className="font-bold text-gray-800">
                    {m.installmentsPaidCount}/{m.installmentsTotal} paid
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">Last paid</p>
                  <p className="font-semibold text-gray-700">{fmtDate(m.lastPaymentDate)}</p>
                </div>
                <div>
                  <p className="text-gray-400">Next due</p>
                  <p className="font-semibold text-gray-700">{fmtDate(m.nextDueDate)}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {openUser && (
        <MemberProfileModal basePath={basePath} userId={openUser} onClose={() => setOpenUser(null)} />
      )}
    </div>
  );
};

export default MembersView;
