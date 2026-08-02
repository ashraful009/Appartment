import React from "react";
import { MapPin } from "lucide-react";

const AREAS = [
  "মতিঝিল",
  "ফার্মগেট",
  "মিরপুর",
  "উত্তরা",
  "ধানমন্ডি",
  "গুলশান",
  "বনানী",
  "সাভার",
];

const LocationSection = () => {
  return (
    <section className="w-[min(1600px,calc(100%-4rem))] mx-auto mb-16 p-8 lg:p-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center bg-gradient-to-br from-white/95 to-[#dbeafe]/40 border border-[rgba(37,99,235,0.12)] rounded-[32px] shadow-[0_20px_45px_rgba(15,23,42,0.12)]" id="project-location">
      <div className="space-y-4">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#dbeafe] text-[#2563eb] text-xs font-bold uppercase tracking-wider">
          Project Location
        </span>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-[#1e3a8a] leading-tight">
          প্রকল্প থেকে মাত্র ১ ঘণ্টার মধ্যে
        </h2>
        <p className="text-[#6b7280] text-base font-medium">
          পৌঁছে যেতে পারবেন ঢাকার গুরুত্বপূর্ণ এলাকায়:
        </p>

        <ul className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {AREAS.map((area, idx) => (
            <li
              key={idx}
              className="flex items-center gap-2 p-3 bg-white border border-[rgba(37,99,235,0.16)] rounded-xl text-sm font-bold text-[#1f2937] shadow-sm"
            >
              <MapPin size={16} className="text-[#2563eb] flex-shrink-0" />
              <span>{area}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="w-full aspect-[4/3] rounded-[24px] overflow-hidden border border-[rgba(37,99,235,0.16)] shadow-[0_16px_42px_rgba(15,23,42,0.14)]">
        <iframe
          src="https://www.google.com/maps?q=Dhaka%20Bangladesh&output=embed"
          title="Project location map"
          className="w-full h-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </section>
  );
};

export default LocationSection;
