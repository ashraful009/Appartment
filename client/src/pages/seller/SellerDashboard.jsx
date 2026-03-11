import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { Calendar, Clock, AlertCircle, ArrowRight, Loader2, Target, TrendingUp, CheckCheck } from "lucide-react";

// ── Task Card ─────────────────────────────────────────────────────────────────
const TaskCard = ({ task, isOverdue }) => {
  const leadUser = task.leadId?.user;
  const date = task.nextMeetingDate ? new Date(task.nextMeetingDate) : null;

  return (
    <div className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all ${isOverdue
      ? "bg-red-50 border-red-200"
      : "bg-emerald-50 border-emerald-200"
      }`}>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${isOverdue ? "bg-red-100" : "bg-emerald-100"
        }`}>
        {isOverdue
          ? <AlertCircle size={16} className="text-red-500" />
          : <Calendar size={16} className="text-emerald-600" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-800 text-sm truncate">
          {leadUser?.name || "Unknown Lead"}
        </p>
        {task.nextMeetingAgenda && (
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{task.nextMeetingAgenda}</p>
        )}
        {date && (
          <p className={`text-xs font-medium mt-1 flex items-center gap-1 ${isOverdue ? "text-red-500" : "text-emerald-600"
            }`}>
            <Clock size={10} />
            {date.toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
            {" · "}
            {date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
          </p>
        )}
      </div>
      <a
        href="/seller/leads"
        className={`flex-shrink-0 flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors ${isOverdue
          ? "text-red-600 bg-red-100 hover:bg-red-200"
          : "text-emerald-700 bg-emerald-100 hover:bg-emerald-200"
          }`}
      >
        View <ArrowRight size={11} />
      </a>
    </div>
  );
};

// ── Target Progress Bar ─────────────────────────────────────────────────────────
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

        // Count approved conversions in the current calendar month
        const now = new Date();
        const month = now.getMonth();
        const year = now.getFullYear();
        const approved = (leadsRes.data.requests || []).filter(r => {
          const isConverted = r.conversionStatus === "approved";
          const inMonth = new Date(r.updatedAt).getMonth() === month &&
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

  if (!target) return null; // admin hasn't set one yet — hide silently

  const globalTarget = target.globalTarget || 1;
  const pct = Math.min(Math.round((conversions / globalTarget) * 100), 100);
  const achieved = pct >= 100;
  const month = target.month;

  return (
    <div className={`rounded-2xl border shadow-sm p-5 mb-6 transition-all ${achieved
      ? "bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200"
      : "bg-white border-gray-100"
      }`}>
      {/* Top row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${achieved ? "bg-emerald-100" : "bg-brand-100"
            }`}>
            {achieved
              ? <CheckCheck size={16} className="text-emerald-600" />
              : <Target size={16} className="text-brand-600" />}
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Monthly Target</p>
            <p className={`text-sm font-extrabold ${achieved ? "text-emerald-700" : "text-gray-800"
              }`}>
              {achieved ? "🎉 Goal Reached!" : `${month} Target`}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className={`text-2xl font-extrabold leading-none ${achieved ? "text-emerald-600" : "text-brand-600"
            }`}>{conversions} <span className="text-base font-medium text-gray-400">/ {globalTarget}</span></p>
          <p className="text-xs text-gray-400 mt-0.5">customers converted</p>
        </div>
      </div>

      {/* Progress bar track */}
      <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${achieved
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
        <TrendingUp size={11} className={achieved ? "text-emerald-500" : "text-brand-500"} />
        {achieved
          ? `You've hit your target for ${month}! Keep going.`
          : `${globalTarget - conversions} more conversion${globalTarget - conversions !== 1 ? "s" : ""} to reach ${month}'s goal.`
        }
      </p>
    </div>
  );
};

// ── Daily Tasks Widget ────────────────────────────────────────────────────────
const DailyTasksWidget = () => {
  const [tasks, setTasks] = useState({ todayTasks: [], overdueTasks: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const { data } = await axios.get("/api/seller/tasks", { withCredentials: true });
        setTasks(data);
      } catch {
        // Silently swallow — widget is non-critical
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const hasAny = tasks.todayTasks.length > 0 || tasks.overdueTasks.length > 0;

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-36 animate-pulse" />
        </div>
        <div className="space-y-3">
          {[1, 2].map(i => (
            <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!hasAny) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
      <h2 className="text-sm font-bold text-gray-700 uppercase tracking-widest mb-4 flex items-center gap-2">
        <Calendar size={14} className="text-brand-500" />
        Follow-up Tasks
      </h2>

      {tasks.overdueTasks.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-semibold text-red-500 uppercase tracking-wider mb-2 flex items-center gap-1">
            <AlertCircle size={11} /> Overdue ({tasks.overdueTasks.length})
          </p>
          <div className="space-y-2">
            {tasks.overdueTasks.map(t => (
              <TaskCard key={t._id} task={t} isOverdue={true} />
            ))}
          </div>
        </div>
      )}

      {tasks.todayTasks.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-2 flex items-center gap-1">
            <Calendar size={11} /> Today's Follow-ups ({tasks.todayTasks.length})
          </p>
          <div className="space-y-2">
            {tasks.todayTasks.map(t => (
              <TaskCard key={t._id} task={t} isOverdue={false} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ── Main ──────────────────────────────────────────────────────────────────────
const SellerDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="p-8">
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Seller Panel</p>
        <h1 className="text-3xl font-extrabold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          Welcome back, {user?.name}! Use your referral code in the sidebar to grow your leads.
        </p>
      </div>

      {/* Target Progress */}
      <TargetProgressBar />

      {/* Daily Tasks Widget */}
      <DailyTasksWidget />
    </div>
  );
};

export default SellerDashboard;
