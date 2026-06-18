import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, FileText, Check, Clock, Building2 } from "lucide-react";

const fmtTk = (n) => `৳ ${Number(n || 0).toLocaleString("en-BD")}`;
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const STATUS_PILL = {
  Paid: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  DataEntryConfirmed: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  AccountantConfirmed: "bg-blue-50 text-blue-700 ring-blue-200",
  Pending: "bg-amber-50 text-amber-700 ring-amber-200",
  Unpaid: "bg-gray-100 text-gray-600 ring-gray-300",
};

const STATUS_LABEL = {
  Unpaid: "Unpaid",
  Pending: "At Accountant",
  AccountantConfirmed: "At Data Entry",
  DataEntryConfirmed: "At Management",
  Paid: "Completed",
};

const TYPE_LABEL = { booking: "Booking Money", downpayment: "Down Payment", installment: "Installment" };

const SummaryCard = ({ label, value }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
    <p className="text-xl font-extrabold text-gray-900 mt-1">{value}</p>
  </div>
);

// Compact confirmation trail for a ledger entry.
const Trail = ({ audit = {} }) => {
  const stages = [
    ["Acct", audit.accountant],
    ["Data", audit.dataEntry],
    ["Mgmt", audit.management],
  ];
  return (
    <div className="space-y-0.5">
      {stages.map(([label, st]) => (
        <p key={label} className="text-[11px] flex items-center gap-1">
          {st?.by ? (
            <>
              <Check size={11} className="text-emerald-500" />
              <span className="text-gray-700 font-medium">{label}:</span>
              <span className="text-gray-600">{st.by.name}</span>
              <span className="text-gray-400">· {fmtDate(st.at)}</span>
            </>
          ) : (
            <>
              <Clock size={11} className="text-gray-300" />
              <span className="text-gray-300">{label}: pending</span>
            </>
          )}
        </p>
      ))}
    </div>
  );
};

const MemberPaymentDetail = () => {
  const { membershipId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`/api/admin/memberships/${membershipId}`, {
        withCredentials: true,
      });
      setData(data);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load membership.");
    } finally {
      setLoading(false);
    }
  }, [membershipId]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="p-8 space-y-4">
        <div className="h-8 w-56 bg-gray-200 rounded-lg animate-pulse" />
        <div className="h-40 bg-gray-100 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!data) return <div className="p-8 text-gray-400">Membership not found.</div>;

  const { membership, ledger, totals } = data;
  const user = membership.userId;

  const FILTERS = ["All", "Unpaid", "Pending", "AccountantConfirmed", "DataEntryConfirmed", "Paid"];
  const visibleLedger = filter === "All" ? ledger : ledger.filter((e) => e.status === filter);

  return (
    <div className="p-8 max-w-5xl">
      <Link
        to="/admin-panel/memberships"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4"
      >
        <ArrowLeft size={15} /> Back to memberships
      </Link>

      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-lg">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-extrabold text-gray-900">{user?.name}</h1>
            <p className="text-sm text-gray-500">
              {user?.email} · {user?.phone}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400 uppercase font-semibold">Status</p>
            <p className="font-bold text-gray-800 capitalize">{membership.status.replace("_", " ")}</p>
            <p className="text-xs text-gray-500 mt-0.5">{membership.shares} share(s)</p>
          </div>
        </div>
        {/* Property info */}
        {membership.propertyId && (
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-3">
            {membership.propertyId.mainImage ? (
              <img
                src={membership.propertyId.mainImage}
                alt={membership.propertyId.name}
                className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                <Building2 size={16} className="text-gray-300" />
              </div>
            )}
            <div>
              <p className="text-sm font-bold text-gray-800">{membership.propertyId.name}</p>
              <p className="text-xs text-gray-400">{membership.propertyId.address}</p>
            </div>
          </div>
        )}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <SummaryCard label="Booking" value={fmtTk(totals.booking)} />
        <SummaryCard label="Down Payment" value={fmtTk(totals.downpayment)} />
        <SummaryCard label="Installments Paid" value={fmtTk(totals.installments)} />
        <SummaryCard label="Total Invested" value={fmtTk(totals.totalPaid)} />
      </div>

      {/* Ledger */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex flex-wrap items-center gap-2 px-5 py-3 border-b border-gray-100 bg-gray-50/60">
          <h2 className="font-bold text-gray-800 mr-2">All Payments</h2>
          {FILTERS.map((f) => {
            const count = f === "All" ? ledger.length : ledger.filter((e) => e.status === f).length;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  filter === f
                    ? "bg-brand-600 text-white"
                    : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {(STATUS_LABEL[f] || f)} ({count})
              </button>
            );
          })}
        </div>
        <div className="overflow-auto max-h-[460px]">
          <table className="w-full text-sm min-w-[820px]">
            <thead className="sticky top-0 z-10">
              <tr className="bg-gray-50 border-b border-gray-100">
                {["Type", "Amount", "Due", "Invoice", "Stage", "Confirmation Trail"].map((c) => (
                  <th
                    key={c}
                    className="px-4 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider bg-gray-50"
                  >
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {visibleLedger.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400 text-xs">
                    No payments to show.
                  </td>
                </tr>
              )}
              {visibleLedger.map((e) => (
                <tr key={e._id} className="hover:bg-gray-50/70 align-top">
                  <td className="px-4 py-3 font-semibold text-gray-800">
                    {TYPE_LABEL[e.type]}
                    {e.type === "installment" && (
                      <span className="text-gray-400 font-normal"> #{e.installmentNumber}</span>
                    )}
                    {e.description && (
                      <p className="text-[11px] text-gray-400 font-normal">{e.description}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 font-bold text-gray-900">{fmtTk(e.amount)}</td>
                  <td className="px-4 py-3 text-gray-500">{fmtDate(e.dueDate)}</td>
                  <td className="px-4 py-3">
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
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ${
                        STATUS_PILL[e.status]
                      }`}
                    >
                      {STATUS_LABEL[e.status] || e.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {e.status === "Unpaid" ? (
                      <span className="text-gray-300 text-xs">—</span>
                    ) : (
                      <Trail audit={e.audit} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MemberPaymentDetail;
