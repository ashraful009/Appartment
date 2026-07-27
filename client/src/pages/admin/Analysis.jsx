import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  BarChart3,
  Search,
  Filter,
  Calendar,
  Building2,
  CheckCircle,
  XCircle,
  User,
  Clock,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  CalendarDays,
  RefreshCcw,
  Check,
  Trash2,
} from "lucide-react";
import { fmtTk, fmtDate } from "../../components/investment/fmt";

const STATUS_PILL = {
  pending_booking: "bg-amber-50 text-amber-700 border-amber-200",
  member: "bg-rose-50 text-rose-700 border-rose-200",
  investor: "bg-cyan-50 text-cyan-700 border-cyan-200",
  lapsed: "bg-gray-100 text-gray-500 border-gray-200",
};

const LEDGER_STATUS_PILL = {
  Paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
  DataEntryConfirmed: "bg-indigo-50 text-indigo-700 border-indigo-200",
  AccountantConfirmed: "bg-blue-50 text-blue-700 border-blue-200",
  Pending: "bg-amber-50 text-amber-700 border-amber-200",
  Unpaid: "bg-gray-100 text-gray-600 border-gray-200",
};

const TYPE_LABEL = {
  booking: "Booking Money",
  downpayment: "Down Payment",
  installment: "Installment",
};

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const Analysis = () => {
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [processFilter, setProcessFilter] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  
  const [properties, setProperties] = useState([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState("");
  const [availableUnits, setAvailableUnits] = useState([]);
  const [loadingUnits, setLoadingUnits] = useState(false);
  const [selectedUnitId, setSelectedUnitId] = useState("");
  const [handoverMonth, setHandoverMonth] = useState(new Date().getMonth() + 1);
  const [handoverYear, setHandoverYear] = useState(new Date().getFullYear());
  const [showAllocate, setShowAllocate] = useState(false);

  
  const [extendingId, setExtendingId] = useState(null);
  const [extendedDate, setExtendedDate] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/management/analysis/memberships", {
        withCredentials: true,
      });
      setMemberships(data);

      
      if (selectedItem) {
        const fresh = data.find((m) => m._id === selectedItem._id);
        if (fresh) setSelectedItem(fresh);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load memberships.");
    } finally {
      setLoading(false);
    }
  }, [selectedItem]);

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    axios
      .get("/api/management/analysis/properties", { withCredentials: true })
      .then(({ data }) => setProperties(data.properties || []))
      .catch(() => {});
  }, []);

  
  const fetchAvailableUnits = async (propertyId) => {
    if (!propertyId) return;
    setLoadingUnits(true);
    try {
      const { data } = await axios.get(`/api/management/buildings/${propertyId}/units`, {
        withCredentials: true,
      });
      
      const unsold = data.filter((u) => u.status === "Unsold");
      setAvailableUnits(unsold);
    } catch {
      toast.error("Failed to load available units.");
      setAvailableUnits([]);
    } finally {
      setLoadingUnits(false);
    }
  };

  const handleAllocate = async () => {
    if (!selectedUnitId) return toast.error("Please select a unit.");
    try {
      await axios.post(
        "/api/management/allocate",
        {
          unitId: selectedUnitId,
          investorId: selectedItem.userId._id,
          membershipId: selectedItem._id,
          handoverMonth,
          handoverYear,
        },
        { withCredentials: true }
      );
      toast.success("Unit allocated successfully!");
      setShowAllocate(false);
      setSelectedUnitId("");
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to allocate unit.");
    }
  };

  const handleDeallocate = async (unitId) => {
    if (!window.confirm("Are you sure you want to remove this unit allocation?")) return;
    try {
      await axios.post("/api/management/deallocate", { unitId }, { withCredentials: true });
      toast.success("Allocation removed successfully!");
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to remove allocation.");
    }
  };

  const handleUpdateHandover = async (unitId) => {
    try {
      await axios.put(
        `/api/management/analysis/unit/${unitId}/handover`,
        { handoverMonth, handoverYear },
        { withCredentials: true }
      );
      toast.success("Handover date updated successfully!");
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update handover date.");
    }
  };

  const handleExtendDueDate = async (ledgerId) => {
    if (!extendedDate) return toast.error("Please pick a valid date.");
    try {
      await axios.put(
        `/api/management/analysis/ledger/${ledgerId}/extend`,
        { newDueDate: extendedDate },
        { withCredentials: true }
      );
      toast.success("Due date extended successfully!");
      setExtendingId(null);
      setExtendedDate("");
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to extend due date.");
    }
  };

  const handleResetLedger = async (ledgerId) => {
    if (
      !window.confirm(
        "Are you sure you want to reset this payment back to Unpaid? This will clear any submitted proofs/receipts and let the user submit again."
      )
    ) {
      return;
    }
    try {
      await axios.put(
        `/api/management/analysis/ledger/${ledgerId}/reset`,
        {},
        { withCredentials: true }
      );
      toast.success("Payment entry has been reset to Unpaid.");
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to reset payment.");
    }
  };

  
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;

  const getFilteredLedger = (ledger = []) => {
    return ledger.filter((e) => {
      
      if (e.type === "booking" || e.type === "downpayment") {
        return e.status !== "Paid";
      }

      
      if (e.type === "installment" && e.dueDate) {
        const d = new Date(e.dueDate);
        const year = d.getFullYear();
        const month = d.getMonth();

        const isPrevMonth = year === prevYear && month === prevMonth;
        const isCurrentMonth = year === currentYear && month === currentMonth;

        if (isPrevMonth) return true;
        if (isCurrentMonth) return e.status !== "Paid";
      }

      return false;
    });
  };

  const filteredMemberships = memberships.filter((m) => {
    
    const matchesSearch =
      !search ||
      m.userId?.name?.toLowerCase().includes(search.toLowerCase()) ||
      m.userId?.email?.toLowerCase().includes(search.toLowerCase()) ||
      m.userId?.phone?.includes(search) ||
      m.propertyId?.name?.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    
    if (statusFilter && m.status !== statusFilter) return false;

    
    if (processFilter) {
      return m.hasUnpaidInProcessRange;
    }

    return true;
  });

  return (
    <div className="p-6 md:p-8 space-y-6">
      
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/20">
          <BarChart3 className="text-white" size={24} />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
            Analysis & Operations
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Monitor and manage payment due extensions, unit allocations, and payment resets.
          </p>
        </div>
      </div>

      
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap items-center gap-4 justify-between">
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          
          <div className="relative w-full sm:w-64">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Search investor, phone, property..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-semibold"
            />
          </div>

          
          <div className="relative w-full sm:w-44">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
              <Filter size={16} />
            </span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-semibold text-gray-600"
            >
              <option value="">All Statuses</option>
              <option value="member">Members</option>
              <option value="investor">Investors</option>
            </select>
          </div>
        </div>

        
        <button
          onClick={() => setProcessFilter(!processFilter)}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm ${
            processFilter
              ? "bg-brand-600 text-white shadow-brand-500/20"
              : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
          }`}
        >
          <Clock size={16} />
          {processFilter ? "Process Mode: Active" : "Filter: Running & Prev Month Unpaid"}
        </button>
      </div>

      
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filteredMemberships.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center text-gray-400">
          No records match the active filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMemberships.map((m) => {
            const hasUnit = !!m.allocatedUnit;
            return (
              <div
                key={m._id}
                onClick={() => {
                  setSelectedItem(m);
                  setShowAllocate(false);
                  setExtendingId(null);
                  if (m.allocatedUnit) {
                    setHandoverMonth(m.allocatedUnit.handoverMonth || 1);
                    setHandoverYear(m.allocatedUnit.handoverYear || new Date().getFullYear());
                  }
                }}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-5 cursor-pointer flex flex-col justify-between hover:-translate-y-0.5 duration-200"
              >
                <div>
                  
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 font-extrabold shrink-0 border border-brand-100">
                        {m.userId?.name?.[0]?.toUpperCase() || <User size={18} />}
                      </div>
                      <div className="min-w-0">
                        <p className="font-extrabold text-gray-900 truncate leading-tight">
                          {m.userId?.name || "Anonymous"}
                        </p>
                        <p className="text-xs text-gray-400 truncate mt-0.5">
                          {m.userId?.phone || m.userId?.email}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border shrink-0 capitalize ${
                        STATUS_PILL[m.status] || "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {m.status}
                    </span>
                  </div>

                  
                  <div className="mb-4 flex items-center gap-2 p-2 bg-gray-50 border border-gray-100 rounded-xl">
                    {m.propertyId?.mainImage ? (
                      <img
                        src={m.propertyId.mainImage}
                        alt={m.propertyId.name}
                        className="w-10 h-8 rounded-lg object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 text-gray-300">
                        <Building2 size={16} />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">
                        Property
                      </p>
                      <p className="text-xs font-bold text-gray-800 truncate leading-tight">
                        {m.propertyId?.name || "—"}
                      </p>
                    </div>
                  </div>

                  
                  <div className="mb-4">
                    {hasUnit ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl text-xs font-semibold">
                        <CheckCircle size={13} /> Unit: {m.allocatedUnit.unitName} (Floor: {m.allocatedUnit.floor})
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 border border-amber-100 rounded-xl text-xs font-semibold">
                        <AlertTriangle size={13} /> No Unit Allocated
                      </span>
                    )}
                  </div>
                </div>

                <div className="border-t border-gray-50 pt-3 flex items-center justify-between text-xs mt-2">
                  <div>
                    <span className="text-gray-400">Total Invested:</span>
                    <span className="ml-1 font-bold text-brand-700">{fmtTk(m.totalApprovedPaid)}</span>
                  </div>
                  {m.unpaidCountInRange > 0 && (
                    <span className="px-2 py-0.5 bg-red-50 text-red-700 border border-red-100 font-bold rounded-full">
                      {m.unpaidCountInRange} Unpaid in process range
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm p-0 md:p-4">
          <div className="bg-white w-full max-w-4xl h-full md:h-auto md:rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            
            <div className="px-6 py-5 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center font-extrabold text-brand-600 text-lg border border-brand-100">
                  {selectedItem.userId?.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-gray-900">{selectedItem.userId?.name}</h2>
                  <p className="text-xs text-gray-500">{selectedItem.userId?.email} · {selectedItem.userId?.phone}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-2 text-gray-400 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <XCircle size={20} />
              </button>
            </div>

            
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              <div className="bg-gray-50 rounded-2xl border border-gray-100 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
                    <Building2 size={16} className="text-brand-600" />
                    Unit Allocation & Handover Status
                  </h3>
                  {selectedItem.allocatedUnit && (
                    <button
                      onClick={() => handleDeallocate(selectedItem.allocatedUnit.unitId)}
                      className="text-xs font-semibold text-red-600 hover:text-red-800 flex items-center gap-1"
                    >
                      <Trash2 size={13} /> Deallocate Unit
                    </button>
                  )}
                </div>

                {selectedItem.allocatedUnit ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm bg-white p-4 rounded-xl border border-gray-100">
                    <div>
                      <p className="text-xs text-gray-400">Allocated Unit</p>
                      <p className="font-bold text-gray-800 text-base mt-0.5">
                        {selectedItem.allocatedUnit.unitName} (Floor: {selectedItem.allocatedUnit.floor}, Line: {selectedItem.allocatedUnit.columnLine})
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Building: {selectedItem.allocatedUnit.building}</p>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-gray-400">Handover Month & Year</p>
                        <p className="font-bold text-gray-800 mt-0.5">
                          {MONTH_NAMES[selectedItem.allocatedUnit.handoverMonth - 1] || "—"}{" "}
                          {selectedItem.allocatedUnit.handoverYear}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <select
                          value={handoverMonth}
                          onChange={(e) => setHandoverMonth(Number(e.target.value))}
                          className="px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold"
                        >
                          {MONTH_NAMES.map((m, idx) => (
                            <option key={m} value={idx + 1}>
                              {m}
                            </option>
                          ))}
                        </select>
                        <input
                          type="number"
                          value={handoverYear}
                          onChange={(e) => setHandoverYear(Number(e.target.value))}
                          className="w-16 px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-center"
                        />
                        <button
                          onClick={() => handleUpdateHandover(selectedItem.allocatedUnit.unitId)}
                          className="px-3 py-1 bg-brand-600 text-white text-xs font-bold rounded-lg hover:bg-brand-700"
                        >
                          Update Date
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white p-4 rounded-xl border border-gray-100 text-center">
                    <p className="text-sm text-gray-500">No unit has been allocated for this property journey.</p>
                    {!showAllocate ? (
                      <button
                        onClick={() => {
                          setShowAllocate(true);
                          const defaultPropId = selectedItem.propertyId?._id || "";
                          setSelectedPropertyId(defaultPropId);
                          if (defaultPropId) {
                            fetchAvailableUnits(defaultPropId);
                          } else {
                            setAvailableUnits([]);
                          }
                        }}
                        className="mt-3 px-4 py-2 bg-brand-600 text-white text-xs font-bold rounded-lg hover:bg-brand-700 inline-flex items-center gap-1.5"
                      >
                        <ShieldCheck size={14} /> Allocate Unit Now
                      </button>
                    ) : (
                      <div className="mt-4 text-left max-w-md mx-auto p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-4">
                        <h4 className="text-xs font-bold text-gray-700">Allocate Apartment Unit</h4>

                        
                        <div>
                          <label className="block text-[10px] text-gray-400 font-bold uppercase mb-1">
                            Select Building / Project
                          </label>
                          <select
                            value={selectedPropertyId}
                            onChange={(e) => {
                              const val = e.target.value;
                              setSelectedPropertyId(val);
                              setSelectedUnitId("");
                              if (val) {
                                fetchAvailableUnits(val);
                              } else {
                                setAvailableUnits([]);
                              }
                            }}
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                          >
                            <option value="">Choose building...</option>
                            {properties.map((p) => (
                              <option key={p._id} value={p._id}>
                                {p.name} ({p.status})
                              </option>
                            ))}
                          </select>
                        </div>

                        {selectedPropertyId && (
                          <>
                            {loadingUnits ? (
                              <div className="h-10 bg-gray-200 rounded-lg animate-pulse text-center flex items-center justify-center text-xs text-gray-400">
                                Loading available units...
                              </div>
                            ) : availableUnits.length === 0 ? (
                              <p className="text-xs text-red-600 font-semibold">
                                No unsold units available in this property.
                              </p>
                            ) : (
                              <div className="space-y-3">
                                <div>
                                  <label className="block text-[10px] text-gray-400 font-bold uppercase mb-1">
                                    Select Available Unit
                                  </label>
                                  <select
                                    value={selectedUnitId}
                                    onChange={(e) => setSelectedUnitId(e.target.value)}
                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold"
                                  >
                                    <option value="">Select unit...</option>
                                    {availableUnits.map((u) => (
                                      <option key={u._id} value={u._id}>
                                        {u.unitName} (Floor {u.floor}, Column {u.columnLine})
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <label className="block text-[10px] text-gray-400 font-bold uppercase mb-1">
                                      Handover Month
                                    </label>
                                    <select
                                      value={handoverMonth}
                                      onChange={(e) => setHandoverMonth(Number(e.target.value))}
                                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold"
                                    >
                                      {MONTH_NAMES.map((m, idx) => (
                                        <option key={m} value={idx + 1}>
                                          {m}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                  <div>
                                    <label className="block text-[10px] text-gray-400 font-bold uppercase mb-1">
                                      Handover Year
                                    </label>
                                    <input
                                      type="number"
                                      value={handoverYear}
                                      onChange={(e) => setHandoverYear(Number(e.target.value))}
                                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-center"
                                    />
                                  </div>
                                </div>

                                <div className="flex gap-2 justify-end pt-2">
                                  <button
                                    onClick={() => setShowAllocate(false)}
                                    className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={handleAllocate}
                                    className="px-3 py-1.5 bg-brand-600 text-white rounded-lg text-xs font-bold hover:bg-brand-700"
                                  >
                                    Allocate Unit
                                  </button>
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              
              <div>
                <h3 className="text-sm font-extrabold text-gray-900 mb-3 flex items-center gap-2">
                  <CalendarDays size={16} className="text-brand-600" />
                  Payments & Installments Ledger
                </h3>
                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs min-w-[700px]">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-gray-600">
                          <th className="text-left px-4 py-3 font-semibold">Payment Details</th>
                          <th className="text-left px-4 py-3 font-semibold">Amount</th>
                          <th className="text-left px-4 py-3 font-semibold">Due Date</th>
                          <th className="text-left px-4 py-3 font-semibold">Status</th>
                          <th className="text-left px-4 py-3 font-semibold">Audit Confirmation Trail</th>
                          <th className="text-right px-4 py-3 font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50 text-gray-700">
                        {getFilteredLedger(selectedItem.ledger).length === 0 ? (
                          <tr>
                            <td colSpan={6} className="text-center py-6 text-gray-400 font-semibold">
                              No payments or installments due in the previous or running month.
                            </td>
                          </tr>
                        ) : (
                          getFilteredLedger(selectedItem.ledger).map((e) => (
                            <tr key={e._id} className="hover:bg-gray-50/50 align-top">
                              
                              <td className="px-4 py-3">
                                <span className="font-bold block text-gray-800">
                                  {TYPE_LABEL[e.type]}
                                  {e.type === "installment" && (
                                    <span className="text-gray-400 font-normal"> #{e.installmentNumber}</span>
                                  )}
                                </span>
                                {e.paymentMethod && (
                                  <span className="text-[10px] text-gray-400">
                                    via {e.paymentMethod}
                                    {e.paymentDetails?.transactionId && ` (Txn ${e.paymentDetails.transactionId})`}
                                  </span>
                                )}
                              </td>

                              
                              <td className="px-4 py-3 font-bold text-gray-900">{fmtTk(e.amount)}</td>

                              
                              <td className="px-4 py-3 whitespace-nowrap">
                                {extendingId === e._id ? (
                                  <div className="flex items-center gap-1.5">
                                    <input
                                      type="date"
                                      value={extendedDate}
                                      onChange={(e) => setExtendedDate(e.target.value)}
                                      className="px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs"
                                    />
                                    <button
                                      onClick={() => handleExtendDueDate(e._id)}
                                      className="p-1 bg-emerald-500 text-white rounded hover:bg-emerald-600"
                                      title="Save"
                                    >
                                      <Check size={12} />
                                    </button>
                                    <button
                                      onClick={() => setExtendingId(null)}
                                      className="p-1 bg-white border border-gray-200 rounded text-gray-400 hover:bg-gray-50"
                                      title="Cancel"
                                    >
                                      <XCircle size={12} />
                                    </button>
                                  </div>
                                ) : (
                                  <span className="font-medium text-gray-600">{fmtDate(e.dueDate)}</span>
                                )}
                              </td>

                              
                              <td className="px-4 py-3">
                                <span
                                  className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                                    LEDGER_STATUS_PILL[e.status] || "bg-gray-100 text-gray-600"
                                  }`}
                                >
                                  {e.status}
                                </span>
                              </td>

                              
                              <td className="px-4 py-3 space-y-0.5 max-w-[200px]">
                                {e.audit?.accountant?.by?.name ? (
                                  <p className="text-[10px] text-emerald-600 font-medium leading-none">
                                     Acct: {e.audit.accountant.by.name} · {fmtDate(e.audit.accountant.at)}
                                  </p>
                                ) : (
                                  <p className="text-[10px] text-gray-300">Acct: pending</p>
                                )}
                                {e.audit?.dataEntry?.by?.name ? (
                                  <p className="text-[10px] text-emerald-600 font-medium leading-none">
                                     Data: {e.audit.dataEntry.by.name} · {fmtDate(e.audit.dataEntry.at)}
                                  </p>
                                ) : (
                                  <p className="text-[10px] text-gray-300">Data: pending</p>
                                )}
                                {e.audit?.management?.by?.name ? (
                                  <p className="text-[10px] text-emerald-600 font-medium leading-none">
                                     Mgmt: {e.audit.management.by.name} · {fmtDate(e.audit.management.at)}
                                  </p>
                                ) : (
                                  <p className="text-[10px] text-gray-300">Mgmt: pending</p>
                                )}
                              </td>

                              
                              <td className="px-4 py-3 text-right">
                                {e.status !== "Paid" && (
                                  <div className="flex items-center justify-end gap-2">
                                    {extendingId !== e._id && (
                                      <button
                                        onClick={() => {
                                          setExtendingId(e._id);
                                          setExtendedDate(
                                            e.dueDate ? new Date(e.dueDate).toISOString().split("T")[0] : ""
                                          );
                                        }}
                                        className="px-2 py-1 bg-brand-50 hover:bg-brand-100 text-brand-700 rounded text-[10px] font-bold"
                                      >
                                        Extend Date
                                      </button>
                                    )}
                                    <button
                                      onClick={() => handleResetLedger(e._id)}
                                      className="p-1 hover:bg-gray-100 text-gray-500 rounded"
                                      title="Reset Payment back to Unpaid"
                                    >
                                      <RefreshCcw size={12} />
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analysis;
