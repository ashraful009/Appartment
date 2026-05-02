import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  ClipboardList, Loader2, Building2, User, Mail, Phone,
  Calendar, Tag,
} from "lucide-react";

const ShortTermRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const { data } = await axios.get("/api/admin/short-term-requests", {
          withCredentials: true,
        });
        setRequests(data.requests || []);
      } catch (err) {
        console.error("Failed to fetch short-term requests:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <ClipboardList className="text-indigo-600" />
          Short-term Inquiries
        </h1>
        <p className="text-gray-500 text-sm mt-2">
          Customer inquiries and price requests for short-term installment properties.
        </p>
      </div>

      {requests.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ClipboardList size={28} className="text-gray-300" />
          </div>
          <p className="text-gray-500 font-medium">No short-term inquiries yet.</p>
          <p className="text-gray-400 text-xs mt-1">
            Inquiries will appear here when customers request pricing for short-term installment properties.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-6 py-3.5 bg-gray-50 border-b border-gray-100 text-xs font-bold uppercase tracking-widest text-gray-500">
            <div className="col-span-3">Customer</div>
            <div className="col-span-3">Contact</div>
            <div className="col-span-3">Property</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-2">Date</div>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-gray-50">
            {requests.map((req) => (
              <div
                key={req._id}
                className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50/50 transition-colors"
              >
                {/* Customer */}
                <div className="col-span-3 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                    <User size={16} className="text-indigo-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {req.user?.name || "Unknown"}
                    </p>
                  </div>
                </div>

                {/* Contact */}
                <div className="col-span-3 space-y-0.5">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Mail size={11} className="flex-shrink-0" />
                    <span className="truncate">{req.user?.email || "—"}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Phone size={11} className="flex-shrink-0" />
                    <span>{req.user?.phone || "—"}</span>
                  </div>
                </div>

                {/* Property */}
                <div className="col-span-3 flex items-center gap-2.5 min-w-0">
                  {req.property?.mainImage ? (
                    <img
                      src={req.property.mainImage}
                      alt=""
                      className="w-9 h-9 rounded-lg object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <Building2 size={14} className="text-gray-300" />
                    </div>
                  )}
                  <p className="text-sm font-medium text-gray-700 truncate">
                    {req.property?.name || "Deleted Property"}
                  </p>
                </div>

                {/* Status */}
                <div className="col-span-1">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      req.status === "assigned"
                        ? "bg-blue-50 text-blue-600 border border-blue-200"
                        : req.status === "pending"
                        ? "bg-amber-50 text-amber-600 border border-amber-200"
                        : "bg-gray-50 text-gray-500 border border-gray-200"
                    }`}
                  >
                    <Tag size={9} />
                    {req.status}
                  </span>
                </div>

                {/* Date */}
                <div className="col-span-2 flex items-center gap-1.5 text-xs text-gray-400">
                  <Calendar size={12} />
                  {new Date(req.createdAt).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              Total: <strong className="text-gray-600">{requests.length}</strong> inquiries
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShortTermRequests;
