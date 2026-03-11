import React, { useEffect, useState } from "react";
import axios from "axios";
import { Target, TrendingUp, CheckCheck } from "lucide-react";

const TargetProgressBar = () => {
  const [target, setTarget] = useState(null);
  const [conversions, setConversions] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [targetRes, leadsRes] = await Promise.all([
          axios.get("/api/targets/current", { withCredentials: true }),
          axios.get("/api/requests/assigned", { withCredentials: true }),
        ]);

        setTarget(targetRes.data.target);

        const now = new Date();
        const month = now.getMonth();
        const year = now.getFullYear();
        const approved = (leadsRes.data.requests || []).filter(r => {
          const isConverted = r.conversionStatus === "approved";
          const inMonth =
            new Date(r.updatedAt).getMonth() === month &&
            new Date(r.updatedAt).getFullYear() === year;
          return isConverted && inMonth;
        });
        setConversions(approved.length);
      } catch {
        // silently skip — non-critical widget
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-40 animate-pulse" />
        <div className="h-4 bg-gray-100 rounded-full animate-pulse" />
        <div className="h-3 bg-gray-100 rounded w-32 animate-pulse" />
      </div>
    );
  }

  if (!target) return null;

  const globalTarget = target.globalTarget || 1;
  const pct = Math.min(Math.round((conversions / globalTarget) * 100), 100);
  const achieved = pct >= 100;
  const month = target.month;

  return (
    <div
      className={`rounded-2xl border shadow-sm p-5 mb-6 transition-all ${
        achieved
          ? "bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200"
          : "bg-white border-gray-100"
      }`}
    >
      {/* Top row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              achieved ? "bg-emerald-100" : "bg-brand-100"
            }`}
          >
            {achieved ? (
              <CheckCheck size={16} className="text-emerald-600" />
            ) : (
              <Target size={16} className="text-brand-600" />
            )}
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
              Monthly Target
            </p>
            <p
              className={`text-sm font-extrabold ${
                achieved ? "text-emerald-700" : "text-gray-800"
              }`}
            >
              {achieved ? "🎉 Goal Reached!" : `${month} Target`}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p
            className={`text-2xl font-extrabold leading-none ${
              achieved ? "text-emerald-600" : "text-brand-600"
            }`}
          >
            {conversions}{" "}
            <span className="text-base font-medium text-gray-400">
              / {globalTarget}
            </span>
          </p>
          <p className="text-xs text-gray-400 mt-0.5">customers converted</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${
            achieved
              ? "bg-gradient-to-r from-emerald-400 to-green-500"
              : pct >= 60
              ? "bg-gradient-to-r from-blue-500 to-emerald-500"
              : "bg-gradient-to-r from-blue-500 to-indigo-500"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Status text */}
      <p className="text-xs text-gray-500 mt-2 flex items-center gap-1.5">
        <TrendingUp
          size={11}
          className={achieved ? "text-emerald-500" : "text-brand-500"}
        />
        {achieved
          ? `You've hit your target for ${month}! Keep going.`
          : `${globalTarget - conversions} more conversion${
              globalTarget - conversions !== 1 ? "s" : ""
            } to reach ${month}'s goal.`}
      </p>
    </div>
  );
};

export default TargetProgressBar;
