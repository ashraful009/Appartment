import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { ReceiptText, CheckCircle, ExternalLink, CalendarDays, Banknote, Building2, UserCircle } from "lucide-react";
const fmtDate = (d) => new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

const CustomerPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  const fetchPayments = async () => {
    try {
      const { data } = await axios.get("/api/accountant/installments", {
        withCredentials: true,
      });
      setPayments(data || []);
    } catch (error) {
      toast.error("Failed to load customer payments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const { data } = await axios.put(
        `/api/accountant/installments/${id}/status`,
        { status: newStatus },
        { withCredentials: true }
      );
      toast.success(data.message || `Status updated to ${newStatus}`);
      fetchPayments();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update status");
    }
  };

  const filteredPayments = payments.filter((p) => {
    if (filter === "All") return true;
    return p.status === filter;
  });

  const StatusBadge = ({ status }) => {
    const config = {
      Unpaid: "bg-gray-100 text-gray-700 border-gray-200",
      Pending: "bg-amber-100 text-amber-700 border-amber-200",
      Paid: "bg-emerald-100 text-emerald-700 border-emerald-200",
      Overdue: "bg-red-100 text-red-700 border-red-200",
    };
    const cls = config[status] || config.Unpaid;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${cls}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="p-6 md:p-8 w-full max-w-7xl mx-auto flex gap-4 flex-col animate-pulse">
        <div className="h-10 w-48 bg-gray-200 rounded-lg"></div>
        <div className="h-64 bg-gray-100 rounded-2xl"></div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 w-full max-w-7xl mx-auto font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            <ReceiptText className="text-brand-600" /> Customer Payments
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Review submitted payment proofs and approve installments
          </p>
        </div>
        
        <div className="flex gap-2">
          {["All", "Pending", "Unpaid", "Paid", "Overdue"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                filter === f
                  ? "bg-brand-600 text-white shadow-md shadow-brand-200"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {filteredPayments.length === 0 ? (
        <div className="bg-white border flex flex-col items-center justify-center p-12 rounded-2xl shadow-sm text-gray-400">
          <ReceiptText size={48} className="mb-4 text-gray-300" />
          <h3 className="text-lg font-bold text-gray-600">No Payments Found</h3>
          <p className="text-sm">There are no installments matching this filter.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 uppercase text-[10px] font-bold text-gray-500 tracking-wider">
                  <th className="px-6 py-4">Installment Info</th>
                  <th className="px-6 py-4">Customer & Unit</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Payment Details</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredPayments.map((p) => {
                  return (
                    <tr key={p._id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm font-bold text-gray-900">{p.installmentName}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <CalendarDays size={12} /> {fmtDate(p.invoiceDate)}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                          <UserCircle size={14} className="text-gray-400" />
                          {p.customerId?.name || "Unknown"}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1.5">
                          <Building2 size={12} className="text-brand-500" />
                          {p.unitId?.propertyId?.name} • Unit {p.unitId?.unitName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm font-bold text-brand-700">
                          ৳ {Number(p.totalAmount).toLocaleString()}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        {p.paymentDetails?.invoiceUrl ? (
                          <div className="flex flex-col gap-1 text-xs">
                            <p className="text-gray-700 font-semibold flex items-center gap-1">
                              <Banknote size={12} className="text-emerald-500"/> {p.paymentDetails.bankName || "Bank N/A"}
                            </p>
                            <p className="text-gray-500 font-mono">Acc: {p.paymentDetails.accountNumber || "N/A"}</p>
                            <a
                              href={p.paymentDetails.invoiceUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-brand-600 hover:text-brand-800 font-semibold underline flex items-center gap-1 mt-1"
                            >
                              View Invoice <ExternalLink size={10} />
                            </a>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic">No proof uploaded</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={p.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                         <div className="flex justify-end items-center gap-2">
                           <select 
                            className="bg-gray-50 border border-gray-200 text-gray-700 text-xs rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-brand-500"
                            value={p.status}
                            onChange={(e) => handleUpdateStatus(p._id, e.target.value)}
                           >
                              <option value="Unpaid">Unpaid</option>
                              <option value="Pending">Pending</option>
                              <option value="Paid">Paid</option>
                              <option value="Overdue">Overdue</option>
                           </select>
                           {p.status === "Pending" && (
                             <button
                               onClick={() => handleUpdateStatus(p._id, "Paid")}
                               className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 p-1.5 rounded-lg transition-colors border border-emerald-200"
                               title="Approve to Paid"
                             >
                               <CheckCircle size={16} />
                             </button>
                           )}
                         </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerPayments;
