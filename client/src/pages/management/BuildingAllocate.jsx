import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Building2,
  Users,
  X,
  Home,
  CalendarClock,
  CheckCircle2,
  Trash2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const fmtHandover = (m, y) => (m && y ? `${MONTHS[m - 1].slice(0, 3)} ${y}` : "—");
const fmtTk = (n) => `৳ ${Number(n || 0).toLocaleString("en-BD")}`;

const STATUS = {
  Unsold: { label: "Available", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  Booked: { label: "Booked", cls: "bg-amber-50 text-amber-700 border-amber-200" },
  Sold: { label: "Sold", cls: "bg-rose-50 text-rose-700 border-rose-200" },
};

// ── Allocate modal ────────────────────────────────────────────────────────────
const AllocateModal = ({ investor, buildings, onClose, onDone }) => {
  const [buildingId, setBuildingId] = useState("");
  const [units, setUnits] = useState([]);
  const [unitId, setUnitId] = useState("");
  const [loadingUnits, setLoadingUnits] = useState(false);
  const [monthVal, setMonthVal] = useState(""); // "YYYY-MM" from <input type="month">
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!buildingId) {
      setUnits([]);
      setUnitId("");
      return;
    }
    setLoadingUnits(true);
    setUnitId("");
    axios
      .get(`/api/management/buildings/${buildingId}/units`, { withCredentials: true })
      .then(({ data }) => setUnits(data.filter((u) => u.status === "Unsold")))
      .catch(() => setUnits([]))
      .finally(() => setLoadingUnits(false));
  }, [buildingId]);

  const submit = async () => {
    if (!buildingId) return toast.error("Select a building.");
    if (!unitId) return toast.error("Select an available unit.");
    if (!monthVal) return toast.error("Pick a handover month.");
    const [year, month] = monthVal.split("-").map(Number);

    setSaving(true);
    try {
      const { data } = await axios.post(
        "/api/management/allocate",
        { unitId, investorId: investor.userId._id, membershipId: investor._id, handoverMonth: month, handoverYear: year },
        { withCredentials: true }
      );
      toast.success(data.message || "Unit allocated.");
      onDone();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to allocate unit.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-gray-100">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div>
            <h3 className="font-extrabold text-gray-900 text-lg">Allocate Unit</h3>
            <p className="text-xs text-gray-500 mt-0.5">For {investor.userId?.name}</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Building dropdown */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Building</label>
            <select
              value={buildingId}
              onChange={(e) => setBuildingId(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            >
              <option value="">Select a building…</option>
              {buildings.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.name} ({b.counts.available} available)
                </option>
              ))}
            </select>
          </div>

          {/* Available units */}
          {buildingId && (
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Available Unit</label>
              {loadingUnits ? (
                <div className="h-10 bg-gray-100 rounded-xl animate-pulse" />
              ) : units.length === 0 ? (
                <p className="text-sm text-amber-600 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
                  No available units in this building.
                </p>
              ) : (
                <select
                  value={unitId}
                  onChange={(e) => setUnitId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                >
                  <option value="">Select a unit…</option>
                  {units.map((u) => (
                    <option key={u._id} value={u._id}>
                      Unit {u.unitName} — Floor {u.floor}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* Handover month/year */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Handover (month & year)
            </label>
            <input
              type="month"
              value={monthVal}
              onChange={(e) => setMonthVal(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>
        </div>

        <div className="p-6 pt-2 border-t border-gray-100 flex gap-3">
          <button
            onClick={onClose}
            disabled={saving}
            className="flex-1 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={saving}
            className="flex-1 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-bold hover:bg-brand-700 disabled:opacity-50"
          >
            {saving ? "Allocating…" : "Allocate"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Building card with expandable units ──────────────────────────────────────
const BuildingCard = ({ building }) => {
  const [open, setOpen] = useState(false);
  const [units, setUnits] = useState(null);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    const next = !open;
    setOpen(next);
    if (next && units === null) {
      setLoading(true);
      try {
        const { data } = await axios.get(`/api/management/buildings/${building._id}/units`, {
          withCredentials: true,
        });
        setUnits(data);
      } catch {
        setUnits([]);
      } finally {
        setLoading(false);
      }
    }
  };

  const c = building.counts;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <button onClick={toggle} className="w-full flex items-center gap-4 p-5 text-left hover:bg-gray-50/60">
        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden shrink-0">
          {building.mainImage ? (
            <img src={building.mainImage} alt={building.name} className="w-full h-full object-cover" />
          ) : (
            <Building2 size={22} className="text-gray-300" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 truncate">{building.name}</p>
          <p className="text-xs text-gray-400 truncate">{building.address}</p>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-700">
              {c.available} Available
            </span>
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-50 text-amber-700">
              {c.booked} Booked
            </span>
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-50 text-rose-700">
              {c.sold} Sold
            </span>
          </div>
        </div>
        {open ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
      </button>

      {open && (
        <div className="border-t border-gray-100 p-5 bg-gray-50/40">
          {loading ? (
            <div className="h-20 bg-gray-100 rounded-xl animate-pulse" />
          ) : !units || units.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No units in this building.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {units.map((u) => {
                const st = STATUS[u.status] || STATUS.Unsold;
                return (
                  <div
                    key={u._id}
                    className={`rounded-xl border px-3 py-2 ${st.cls}`}
                    title={u.allocatedTo ? `Allocated to ${u.allocatedTo.name}` : ""}
                  >
                    <p className="font-bold text-sm text-gray-800">Unit {u.unitName}</p>
                    <p className="text-[10px] text-gray-500">Floor {u.floor}</p>
                    <p className="text-[10px] font-semibold mt-0.5">{st.label}</p>
                    {u.allocatedTo && (
                      <p className="text-[10px] text-gray-600 mt-0.5 truncate">
                        → {u.allocatedTo.name} · {fmtHandover(u.handoverMonth, u.handoverYear)}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ── Page ──────────────────────────────────────────────────────────────────────
const BuildingAllocate = () => {
  const [tab, setTab] = useState("investors");
  const [buildings, setBuildings] = useState([]);
  const [investors, setInvestors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalInvestor, setModalInvestor] = useState(null);
  const [busyUnit, setBusyUnit] = useState(null);

  const loadInvestors = useCallback(async () => {
    const { data } = await axios.get("/api/management/investors", { withCredentials: true });
    setInvestors(data);
  }, []);

  const loadBuildings = useCallback(async () => {
    const { data } = await axios.get("/api/management/buildings", { withCredentials: true });
    setBuildings(data);
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([loadInvestors(), loadBuildings()]);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load data.");
    } finally {
      setLoading(false);
    }
  }, [loadInvestors, loadBuildings]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const removeAllocation = async (unitId) => {
    setBusyUnit(unitId);
    try {
      await axios.post("/api/management/deallocate", { unitId }, { withCredentials: true });
      toast.success("Allocation removed.");
      await Promise.all([loadInvestors(), loadBuildings()]);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to remove allocation.");
    } finally {
      setBusyUnit(null);
    }
  };

  const onAllocated = async () => {
    await Promise.all([loadInvestors(), loadBuildings()]);
  };

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-2xl bg-brand-600 flex items-center justify-center">
          <Building2 size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Building Allocate</h1>
          <p className="text-sm text-gray-500">
            Allocate available units to investors and track every building's inventory.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        {[
          { key: "investors", label: "Investors", icon: Users },
          { key: "buildings", label: "Buildings & Units", icon: Home },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
              tab === key
                ? "bg-brand-600 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : tab === "investors" ? (
        investors.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center text-gray-400">
            No investors yet.
          </div>
        ) : (
          <div className="space-y-3">
            {investors.map((inv) => (
              <div
                key={inv._id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-wrap items-center gap-4"
              >
                <div className="w-11 h-11 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold shrink-0">
                  {inv.userId?.name?.[0]?.toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-gray-900 truncate">{inv.userId?.name}</p>
                  <p className="text-xs text-gray-400 truncate">{inv.userId?.email}</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    {inv.shares} share(s) · {fmtTk(inv.totalApprovedPaid)} invested
                  </p>
                </div>

                <div className="ml-auto flex items-center gap-3">
                  {inv.allocatedUnit ? (
                    <>
                      <div className="text-right">
                        <p className="text-xs font-bold text-gray-800 flex items-center gap-1 justify-end">
                          <CheckCircle2 size={13} className="text-emerald-500" />
                          {inv.allocatedUnit.building} · Unit {inv.allocatedUnit.unitName}
                        </p>
                        <p className="text-[11px] text-gray-500 flex items-center gap-1 justify-end">
                          <CalendarClock size={11} /> Handover{" "}
                          {fmtHandover(inv.allocatedUnit.handoverMonth, inv.allocatedUnit.handoverYear)}
                        </p>
                      </div>
                      <button
                        onClick={() => setModalInvestor(inv)}
                        className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-50"
                      >
                        Change
                      </button>
                      <button
                        onClick={() => removeAllocation(inv.allocatedUnit.unitId)}
                        disabled={busyUnit === inv.allocatedUnit.unitId}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg disabled:opacity-50"
                        title="Remove allocation"
                      >
                        <Trash2 size={15} />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setModalInvestor(inv)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 text-white text-sm font-bold rounded-xl hover:bg-brand-700"
                    >
                      <Home size={15} /> Allocate Unit
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      ) : buildings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center text-gray-400">
          No buildings yet.
        </div>
      ) : (
        <div className="space-y-3">
          {buildings.map((b) => (
            <BuildingCard key={b._id} building={b} />
          ))}
        </div>
      )}

      {modalInvestor && (
        <AllocateModal
          investor={modalInvestor}
          buildings={buildings}
          onClose={() => setModalInvestor(null)}
          onDone={onAllocated}
        />
      )}
    </div>
  );
};

export default BuildingAllocate;
