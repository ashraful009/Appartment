import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const SCHEME_NAME = "Nirapod Nibash — Investment Scheme";

const fmtTk = (n) => `BDT ${Number(n || 0).toLocaleString("en-BD")}`;
const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    : "—";

const TYPE_LABEL = {
  booking: "Booking Money",
  downpayment: "Down Payment",
  installment: "Installment",
};

const rowFor = (e) => [
  e.type === "installment" ? `${TYPE_LABEL.installment} #${e.installmentNumber}` : TYPE_LABEL[e.type] || "Payment",
  e.type === "installment" ? `#${e.installmentNumber}` : "—",
  fmtDate(e.dueDate),
  fmtTk(e.amount),
];

const methodLine = (entry) => {
  const d = entry.paymentDetails || {};
  if (entry.paymentMethod === "MFS")
    return `Method: MFS (${d.provider}) · ${d.mobileNumber} · Txn ${d.transactionId}`;
  if (entry.paymentMethod === "Bank")
    return `Method: Bank (${d.bankName}) · A/C ${d.accountNumber} · Txn ${d.transactionId}`;
  return "Method: Cash";
};

/**
 * Build & save an invoice PDF for one or more ledger entries that share a single
 * payment (same user, same invoice/batch). Pass an array of entries.
 */
const buildInvoice = (entries) => {
  const list = Array.isArray(entries) ? entries : [entries];
  if (list.length === 0) return;

  const lead = list[0];
  const user = lead.userId || {};
  const audit = lead.audit || {};
  const total = list.reduce((s, e) => s + (e.amount || 0), 0);

  const doc = new jsPDF();

  // Header
  doc.setFontSize(18);
  doc.setFont(undefined, "bold");
  doc.text("Payment Invoice", 14, 18);
  doc.setFontSize(10);
  doc.setFont(undefined, "normal");
  doc.setTextColor(110);
  doc.text(SCHEME_NAME, 14, 25);
  doc.setTextColor(0);

  // Meta
  const metaX = 130;
  doc.setFontSize(9);
  doc.text(`Invoice #: ${String(lead._id || "").slice(-8).toUpperCase()}`, metaX, 18);
  doc.text(`Payment Date: ${fmtDate(lead.submittedAt)}`, metaX, 24);

  // Bill to
  doc.setFontSize(11);
  doc.setFont(undefined, "bold");
  doc.text("Billed To", 14, 40);
  doc.setFont(undefined, "normal");
  doc.setFontSize(10);
  doc.text(user.name || "—", 14, 46);
  doc.text(user.email || "—", 14, 52);
  doc.text(user.phone || "—", 14, 58);

  // Items
  autoTable(doc, {
    startY: 66,
    head: [["Description", "Installment #", "Due Date", "Amount"]],
    body: list.map(rowFor),
    foot: [["", "", "Total", fmtTk(total)]],
    headStyles: { fillColor: [37, 99, 235] },
    footStyles: { fillColor: [243, 244, 246], textColor: 20, fontStyle: "bold" },
    styles: { fontSize: 10, cellPadding: 3 },
  });

  // Footer — payment method + confirmation audit trail
  let y = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(9);
  doc.setTextColor(90);
  doc.text(methodLine(lead), 14, y);
  doc.text(`Status: ${lead.status}`, 14, y + 6);

  y += 16;
  doc.setFont(undefined, "bold");
  doc.setTextColor(40);
  doc.text("Confirmation Trail", 14, y);
  doc.setFont(undefined, "normal");
  doc.setTextColor(90);
  const stages = [
    ["Accountant", audit.accountant],
    ["Data Entry", audit.dataEntry],
    ["Management", audit.management],
  ];
  stages.forEach(([label, st], i) => {
    const name = st?.by?.name || "—";
    const when = st?.at ? fmtDate(st.at) : "Pending";
    doc.text(`${label}: ${name}  (${when})`, 14, y + 6 + i * 6);
  });

  const fname = `invoice_${(user.name || "payment").replace(/\s+/g, "_")}_${String(lead._id || "").slice(-6)}.pdf`;
  doc.save(fname);
};

export const downloadInvoice = (entry) => buildInvoice(entry);
export const downloadBatchInvoice = (entries) => buildInvoice(entries);
