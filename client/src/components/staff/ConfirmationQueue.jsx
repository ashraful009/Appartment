import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  ClipboardCheck,
  Check,
  X,
  FileText,
  Download,
  Smartphone,
  Landmark,
  Banknote,
  UserSearch,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { fmtTk, fmtDate } from "../investment/fmt";
import { downloadBatchInvoice } from "../../utils/investmentInvoice";
import MemberProfileModal from "./MemberProfileModal";

const ProofViewerModal = ({ url, onClose }) => {
  const isPdf = url?.toLowerCase().includes(".pdf");
  const previewUrl = isPdf ? url.replace(/\.pdf(\?.*)?$/i, ".jpg$1") : url;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl h-[85vh] flex flex-col overflow-hidden relative shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h3 className="font-extrabold text-gray-900 text-lg">Payment Proof</h3>
          <div className="flex items-center gap-2">
            {isPdf && (
              <a href={url} target="_blank" rel="noreferrer" className="px-3 py-1.5 bg-brand-50 text-brand-700 text-xs font-bold rounded-lg hover:bg-brand-100">
                Open Original PDF
              </a>
            )}
            <button onClick={onClose} className="p-1.5 text-gray-400 hover:bg-gray-200 rounded-lg transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>
        <div className="flex-1 bg-gray-100/50 overflow-auto flex items-center justify-center p-4">
          <img src={previewUrl} alt="Payment Proof" className="max-w-full max-h-full object-contain rounded-xl shadow-sm" />
        </div>
      </div>
    </div>
  );
};

const TYPE_LABEL = { booking: "Booking Money", downpayment: "Down Payment", installment: "Installment" };
const METHOD_ICON = { MFS: Smartphone, Bank: Landmark, Cash: Banknote };
const STAGE_OUTPUT = {
  accountant: "AccountantConfirmed",
  dataEntry: "DataEntryConfirmed",
  management: "Paid",
};

const groupEntries = (entries) => {
  const groups = {};
  for (const e of entries) {
    const key = e.batchId || e._id;
    (groups[key] ||= { key, batchId: e.batchId, entries: [] }).entries.push(e);
  }
  return Object.values(groups);
};

const MethodDetails = ({ entry }) => {
  const d = entry.paymentDetails || {};
  const Icon = METHOD_ICON[entry.paymentMethod] || Banknote;
  let text = "Cash";
  if (entry.paymentMethod === "MFS") text = `${d.provider} · ${d.mobileNumber} · Txn ${d.transactionId}`;
  else if (entry.paymentMethod === "Bank")
    text = `${d.bankName} · A/C ${d.accountNumber} · Txn ${d.transactionId}`;
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-gray-600">
      <Icon size={13} className="text-gray-400" /> {text}
    </span>
  );
};

const AuditTrail = ({ audit = {} }) => {
  const stages = [
    ["Accountant", audit.accountant],
    ["Data Entry", audit.dataEntry],
  ];
  const done = stages.filter(([, st]) => st?.by);
  if (done.length === 0) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {done.map(([label, st]) => (
        <span key={label} className="inline-flex items-center gap-1 text-[11px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
          <Check size={11} /> {label}: {st.by?.name || "—"}
        </span>
      ))}
    </div>
  );
};


const ConfirmationQueue = ({ basePath, stageKey, title, subtitle }) => {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null);
  const [confirmed, setConfirmed] = useState({});
  const [profileUser, setProfileUser] = useState(null);
  const [proofUrl, setProofUrl] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${basePath}/pending`, { withCredentials: true });
      setGroups(groupEntries(data));
      setConfirmed({});
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load pending payments.");
    } finally {
      setLoading(false);
    }
  }, [basePath]);

  useEffect(() => {
    load();
  }, [load]);

  const confirm = async (group) => {
    setBusy(group.key);
    try {
      if (group.batchId) {
        await axios.put(`${basePath}/ledger/batch/${group.batchId}/confirm`, {}, { withCredentials: true });
      } else {
        await axios.put(`${basePath}/ledger/${group.entries[0]._id}/confirm`, {}, { withCredentials: true });
      }
      const now = new Date().toISOString();
      const patched = group.entries.map((e) => ({
        ...e,
        status: STAGE_OUTPUT[stageKey],
        audit: { ...(e.audit || {}), [stageKey]: { by: { name: user?.name }, at: now } },
      }));
      setConfirmed((prev) => ({ ...prev, [group.key]: { entries: patched } }));
      toast.success("Payment confirmed.");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to confirm.");
    } finally {
      setBusy(null);
    }
  };

  const reject = async (group) => {
    setBusy(group.key);
    try {
      await Promise.all(
        group.entries.map((e) =>
          axios.put(`${basePath}/ledger/${e._id}/reject`, {}, { withCredentials: true })
        )
      );
      toast.success("Payment rejected.");
      await load();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to reject.");
    } finally {
      setBusy(null);
    }
  };

  if (loading) {
    return (
      <div className="p-8 space-y-4">
        <div className="h-8 w-64 bg-gray-200 rounded-lg animate-pulse" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-28 bg-gray-100 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-2xl bg-brand-600 flex items-center justify-center">
          <ClipboardCheck size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">{title}</h1>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </div>
      </div>

      {groups.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center text-gray-400">
          Nothing to confirm right now.
        </div>
      ) : (
        <div className="space-y-4">
          {groups.map((group) => {
            const lead = group.entries[0];
            const u = lead.userId || {};
            const total = group.entries.reduce((s, e) => s + (e.amount || 0), 0);
            const isConfirmed = !!confirmed[group.key];
            const entriesForInvoice = confirmed[group.key]?.entries || group.entries;

            return (
              <div key={group.key} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-gray-900">{u.name}</p>
                    <p className="text-xs text-gray-400">{u.email} · {u.phone}</p>
                    {lead.propertyId && (
                      <p className="text-xs text-brand-700 font-bold mt-0.5">Property: {lead.propertyId.name}</p>
                    )}
                    <div className="mt-1.5"><MethodDetails entry={lead} /></div>
                    <AuditTrail audit={lead.audit} />
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-extrabold text-brand-700">{fmtTk(total)}</p>
                    <p className="text-[11px] text-gray-400">Submitted {fmtDate(lead.submittedAt)}</p>
                    <button
                      onClick={() => setProfileUser(lead.membershipId)}
                      className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-brand-600 hover:text-brand-800"
                    >
                      <UserSearch size={12} /> View full info
                    </button>
                  </div>
                </div>

                
                <div className="mt-3 flex flex-wrap gap-2">
                  {group.entries.map((e) => (
                    <span
                      key={e._id}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-50 border border-gray-100 rounded-lg text-xs text-gray-600"
                    >
                      {e.type === "installment"
                        ? `Installment #${e.installmentNumber}`
                        : TYPE_LABEL[e.type]}
                      <span className="font-semibold text-gray-800">{fmtTk(e.amount)}</span>
                    </span>
                  ))}
                </div>

                
                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-gray-50 pt-3">
                  {lead.invoiceUrl && (
                    <button
                      onClick={() => setProofUrl(lead.invoiceUrl)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-800"
                    >
                      <FileText size={14} /> View uploaded proof
                    </button>
                  )}

                  <div className="ml-auto flex items-center gap-2">
                    {isConfirmed ? (
                      <>
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600">
                          <Check size={14} /> Confirmed
                        </span>
                        <button
                          onClick={() => downloadBatchInvoice(entriesForInvoice)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-600 text-white text-xs font-bold rounded-lg hover:bg-brand-700"
                        >
                          <Download size={14} /> Download Invoice
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => confirm(group)}
                          disabled={busy === group.key}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                        >
                          <Check size={14} /> Confirm
                        </button>
                        <button
                          onClick={() => reject(group)}
                          disabled={busy === group.key}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-gray-600 text-xs font-bold rounded-lg hover:bg-gray-50 disabled:opacity-50"
                        >
                          <X size={14} /> Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {profileUser && (
        <MemberProfileModal basePath={basePath} userId={profileUser} onClose={() => setProfileUser(null)} />
      )}
      {proofUrl && (
        <ProofViewerModal url={proofUrl} onClose={() => setProofUrl(null)} />
      )}
    </div>
  );
};

export default ConfirmationQueue;
