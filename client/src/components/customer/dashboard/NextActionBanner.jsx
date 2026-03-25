import React from "react";
import { CalendarCheck } from "lucide-react";

/**
 * NextActionBanner — Sticky attention-grabbing banner for the next upcoming meeting.
 *
 * Props:
 *  - meeting {object | null}  The upcomingMeeting object from the overview API.
 *                             If null, renders nothing.
 *
 * Expected meeting shape:
 *  {
 *    nextMeetingDate,    // ISO date string
 *    nextMeetingAgenda,  // string
 *    leadId: {
 *      property: { title, location }
 *    },
 *    sellerId: { name }
 *  }
 */
const NextActionBanner = ({ meeting }) => {
  if (!meeting) return null;

  // ── Format the date nicely ───────────────────────────────────────────────
  const formatted = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(meeting.nextMeetingDate));

  const propertyTitle = meeting.leadId?.property?.title ?? "a property";
  const propertyLocation = meeting.leadId?.property?.location ?? "";
  const sellerName = meeting.sellerId?.name ?? "your agent";
  const agenda = meeting.nextMeetingAgenda || "Meeting details pending.";

  return (
    <div className="mb-8 flex items-start gap-4 rounded-2xl bg-indigo-50 border border-indigo-200 px-5 py-4 shadow-sm">
      {/* Icon */}
      <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center flex-shrink-0 mt-0.5">
        <CalendarCheck size={20} className="text-white" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-0.5">
          Upcoming Meeting
        </p>
        <p className="text-sm font-semibold text-indigo-900">
          {formatted}
        </p>
        <p className="text-sm text-indigo-700 mt-0.5 truncate">
          <span className="font-medium">{propertyTitle}</span>
          {propertyLocation && (
            <span className="text-indigo-500"> &middot; {propertyLocation}</span>
          )}
        </p>
        <p className="text-xs text-indigo-600 mt-1">
          <span className="font-medium">Agenda:</span> {agenda} &mdash; with{" "}
          <span className="font-medium">{sellerName}</span>
        </p>
      </div>
    </div>
  );
};

export default NextActionBanner;
