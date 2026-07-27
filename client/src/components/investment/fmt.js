

export const fmtTk = (n) =>
  n != null ? `৳ ${Number(n).toLocaleString("en-BD")}` : "—";

export const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";


export const daysUntil = (d) => {
  if (!d) return null;
  const ms = new Date(d).getTime() - Date.now();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
};

export const STATUS_PILL = {
  Paid:                "bg-emerald-50 text-emerald-700 ring-emerald-200",
  DataEntryConfirmed:  "bg-indigo-50 text-indigo-700 ring-indigo-200",
  AccountantConfirmed: "bg-blue-50 text-blue-700 ring-blue-200",
  Pending:             "bg-amber-50 text-amber-700 ring-amber-200",
  Unpaid:              "bg-gray-100 text-gray-600 ring-gray-300",
};


export const STATUS_LABEL = {
  Unpaid:              "Unpaid",
  Pending:             "Submitted",
  AccountantConfirmed: "Accountant ",
  DataEntryConfirmed:  "Data Entry ",
  Paid:                "Paid",
};

export const IN_PROGRESS_STATUSES = ["Pending", "AccountantConfirmed", "DataEntryConfirmed"];
