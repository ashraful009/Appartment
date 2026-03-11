import React, { useState } from "react";
import { AlertCircle, Calendar, Clock, CheckCheck, Loader2 } from "lucide-react";

const FollowUpTaskCard = ({ task, isOverdue, onUpdateStatus, onExpandLead }) => {
  const leadUser = task.leadId?.user;
  const date = task.nextMeetingDate ? new Date(task.nextMeetingDate) : null;
  const [updating, setUpdating] = useState(false);

  const handleAction = async (status) => {
    setUpdating(true);
    try { await onUpdateStatus(task._id, status); }
    finally { setUpdating(false); }
  };

  return (
    <div className={`rounded-xl border p-3.5 transition-all ${
      isOverdue ? "bg-red-50 border-red-200" : "bg-emerald-50 border-emerald-200"
    }`}>
      {/* Top row */}
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
          isOverdue ? "bg-red-100" : "bg-emerald-100"
        }`}>
          {isOverdue
            ? <AlertCircle size={16} className="text-red-500" />
            : <Calendar size={16} className="text-emerald-600" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={() => onExpandLead(task.leadId?._id)}
              className={`font-semibold text-sm text-left truncate hover:underline ${
                isOverdue ? "text-red-700" : "text-emerald-800"
              }`}
            >
              {leadUser?.name || "Unknown Lead"}
            </button>
            {task.followUpStatus === "Unable to Contact" && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-orange-100 text-orange-600 flex-shrink-0">
                Try again later
              </span>
            )}
          </div>
          {task.nextMeetingAgenda && (
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{task.nextMeetingAgenda}</p>
          )}
          {date && (
            <p className={`text-xs font-medium mt-1 flex items-center gap-1 ${
              isOverdue ? "text-red-500" : "text-emerald-600"
            }`}>
              <Clock size={10} />
              {date.toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
              {" · "}
              {date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
            </p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 mt-2.5 ml-11">
        <button
          onClick={() => handleAction("Completed")}
          disabled={updating}
          className="flex items-center gap-1 px-3 py-1.5 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
        >
          {updating ? <Loader2 size={12} className="animate-spin" /> : <CheckCheck size={12} />}
          Complete
        </button>
        <button
          onClick={() => handleAction("Unable to Contact")}
          disabled={updating || task.followUpStatus === "Unable to Contact"}
          className="flex items-center gap-1 px-3 py-1.5 bg-orange-100 text-orange-700 hover:bg-orange-200 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
        >
          {updating ? <Loader2 size={12} className="animate-spin" /> : <AlertCircle size={12} />}
          Unable to contact
        </button>
      </div>
    </div>
  );
};

export default FollowUpTaskCard;
