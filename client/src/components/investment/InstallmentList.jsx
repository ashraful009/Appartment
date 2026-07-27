import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ReceiptText } from "lucide-react";
import { fmtTk, fmtDate, STATUS_PILL, STATUS_LABEL, IN_PROGRESS_STATUSES } from "./fmt";

const StatusBadge = ({ status }) => (
  <span
    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ${
      STATUS_PILL[status] || STATUS_PILL.Pending
    }`}
  >
    {STATUS_LABEL[status] || status}
  </span>
);


const FILTERS = ["All", "Unpaid", "In Progress", "Paid"];

const matchesFilter = (inst, filter) => {
  if (filter === "All") return true;
  if (filter === "In Progress") return IN_PROGRESS_STATUSES.includes(inst.status);
  return inst.status === filter;
};

const isOverdue = (inst) =>
  inst.status === "Unpaid" && inst.dueDate && new Date(inst.dueDate) < new Date();

const InstallmentList = ({ installments, membershipId }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selected, setSelected] = useState([]);
  const [filter, setFilter] = useState("All");

  const unpaid = installments.filter((i) => i.status === "Unpaid");
  const visible = installments.filter((i) => matchesFilter(i, filter));
  const selectedEntries = installments.filter((i) => selected.includes(i._id));
  const totalSelected = selectedEntries.reduce((s, i) => s + (i.amount || 0), 0);

  const toggle = (id) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const toggleAll = () =>
    setSelected(selected.length === unpaid.length ? [] : unpaid.map((i) => i._id));

  const goPay = (ids, total, count) =>
    navigate("/membership/pay", {
      state: {
        kind: "installment",
        installmentIds: ids,
        total,
        count,
        membershipId,
        returnTo: location.pathname,
      },
    });

  if (!installments.length) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
        <ReceiptText size={28} className="text-gray-300 mx-auto mb-3" />
        <p className="text-sm font-semibold text-gray-600">No installments yet</p>
        <p className="text-xs text-gray-400 mt-1">
          Installments appear once your down payment is approved.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      
      <div className="flex flex-wrap items-center gap-2 px-5 py-3 border-b border-gray-100 bg-gray-50/60">
        {FILTERS.map((f) => {
          const count = installments.filter((i) => matchesFilter(i, f)).length;
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
              {f} ({count})
            </button>
          );
        })}
      </div>

      
      <div className="flex flex-wrap items-center gap-3 px-5 py-2.5 border-b border-gray-100">
        <button
          onClick={toggleAll}
          disabled={unpaid.length === 0}
          className="text-xs font-semibold text-brand-600 hover:text-brand-800 disabled:text-gray-300"
        >
          {selected.length === unpaid.length && unpaid.length > 0
            ? "Clear selection"
            : "Select all unpaid"}
        </button>
        {selected.length > 0 && (
          <span className="text-xs text-gray-500">
            {selected.length} selected · {fmtTk(totalSelected)}
          </span>
        )}
        <button
          onClick={() => goPay(selected, totalSelected, selected.length)}
          disabled={selected.length === 0}
          className="ml-auto px-4 py-2 bg-brand-600 text-white text-xs font-bold rounded-lg hover:bg-brand-700 disabled:opacity-40"
        >
          Pay Selected
        </button>
      </div>

      
      <div className="overflow-auto max-h-[400px]">
        <table className="w-full text-sm min-w-[560px]">
          <thead className="sticky top-0 z-10">
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-4 py-3 w-10 bg-gray-50"></th>
              {["#", "Amount", "Due Date", "Status"].map((c) => (
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
            {visible.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400 text-xs">
                  No {filter.toLowerCase()} installments.
                </td>
              </tr>
            )}
            {visible.map((inst) => {
              const unpaidRow = inst.status === "Unpaid";
              const overdue = isOverdue(inst);
              return (
                <tr key={inst._id} className="hover:bg-gray-50/70">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      disabled={!unpaidRow}
                      checked={selected.includes(inst._id)}
                      onChange={() => toggle(inst._id)}
                      className="w-4 h-4 accent-brand-600 disabled:opacity-30"
                    />
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-800">{inst.installmentNumber}</td>
                  <td className="px-4 py-3 font-bold text-gray-900">{fmtTk(inst.amount)}</td>
                  <td className="px-4 py-3">
                    <span className={overdue ? "text-red-600 font-semibold" : "text-gray-500"}>
                      {fmtDate(inst.dueDate)}
                      {overdue && <span className="ml-1 text-[10px] uppercase">overdue</span>}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {unpaidRow ? (
                      <button
                        onClick={() => goPay([inst._id], inst.amount, 1)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ring-1 transition-colors ${
                          overdue
                            ? "bg-red-50 text-red-700 ring-red-200 hover:bg-red-100"
                            : "bg-gray-100 text-gray-700 ring-gray-300 hover:bg-brand-50 hover:text-brand-700 hover:ring-brand-300"
                        }`}
                        title="Click to pay this installment"
                      >
                        Unpaid · Pay now
                      </button>
                    ) : (
                      <StatusBadge status={inst.status} />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InstallmentList;
