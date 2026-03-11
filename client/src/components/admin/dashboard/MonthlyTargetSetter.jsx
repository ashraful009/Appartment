import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Target, Clock, CheckCheck, Loader2 } from "lucide-react";

/**
 * MonthlyTargetSetter — admin widget to view & set the monthly global target.
 * Self-contained with its own fetch and save logic.
 */
const MonthlyTargetSetter = () => {
  const now          = new Date();
  const currentMonth = now.toLocaleString("en-US", { month: "long" });
  const currentYear  = now.getFullYear();

  const [targetValue,    setTargetValue]    = useState("");
  const [current,        setCurrent]        = useState(null);
  const [saving,         setSaving]         = useState(false);
  const [loadingCurrent, setLoadingCurrent] = useState(true);

  useEffect(() => {
    axios.get("/api/targets/current", { withCredentials: true })
      .then(({ data }) => {
        setCurrent(data.target);
        if (data.target) setTargetValue(String(data.target.globalTarget));
      })
      .catch(() => {})
      .finally(() => setLoadingCurrent(false));
  }, []);

  const handleSave = async () => {
    const num = Number(targetValue);
    if (!targetValue || isNaN(num) || num < 0) {
      toast.error("Please enter a valid positive number.");
      return;
    }
    setSaving(true);
    try {
      const { data } = await axios.post("/api/admin/targets", {
        month: currentMonth,
        year: currentYear,
        globalTarget: num,
      }, { withCredentials: true });
      setCurrent(data.target);
      toast.success(`Target set: ${num} conversions for ${currentMonth} ${currentYear}`);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save target.");
    } finally { setSaving(false); }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
          <Target size={20} className="text-amber-600" />
        </div>
        <div>
          <p className="font-extrabold text-gray-800 text-sm">Monthly Target</p>
          <p className="text-xs text-gray-400">{currentMonth} {currentYear}</p>
        </div>
      </div>

      {/* Current target display */}
      {loadingCurrent ? (
        <div className="h-10 bg-gray-100 rounded-xl mb-4 animate-pulse" />
      ) : current ? (
        <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-amber-600 font-semibold uppercase tracking-wide">Current Target</p>
            <p className="text-3xl font-extrabold text-amber-700">{current.globalTarget}
              <span className="text-base font-medium text-amber-500 ml-1.5">conversions</span>
            </p>
          </div>
          <Clock size={28} className="text-amber-300" />
        </div>
      ) : (
        <div className="mb-4 text-xs text-gray-400 italic">No target set for this month yet.</div>
      )}

      {/* Input form */}
      <div className="flex gap-3">
        <input
          type="number"
          min="0"
          value={targetValue}
          onChange={e => setTargetValue(e.target.value)}
          placeholder="e.g. 10"
          className="flex-1 text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
        <button
          onClick={handleSave}
          disabled={saving || !targetValue}
          className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-semibold text-sm rounded-xl transition-colors"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <CheckCheck size={14} />}
          {saving ? "Saving…" : current ? "Update" : "Set Target"}
        </button>
      </div>
    </div>
  );
};

export default MonthlyTargetSetter;
