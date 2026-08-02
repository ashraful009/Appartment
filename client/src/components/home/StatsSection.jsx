import React from "react";

const STATS = [
  { count: "500", label: "Total Flat" },
  { count: "200", label: "Studio Apartment" },
  { count: "192", label: "Shop" },
  { count: "1", label: "School" },
  { count: "2", label: "Hospital Clinic" },
  { count: "1", label: "Community Hall" },
  { count: "2", label: "Super Shop" },
];

const StatsSection = () => {
  return (
    <section className="w-[min(1600px,calc(100%-4rem))] mx-auto my-[clamp(2rem,4vw,3.5rem)] mb-12" aria-label="Company statistics">
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4 lg:gap-6">
        {STATS.map((stat, idx) => (
          <article
            key={idx}
            className="p-6 bg-white border border-[rgba(37,99,235,0.16)] rounded-[24px] shadow-[0_14px_36px_rgba(15,23,42,0.06)] text-center transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_18px_40px_rgba(15,23,42,0.12)]"
          >
            <h3 className="my-1 text-2xl font-bold text-[#1e3a8a]">{stat.count}</h3>
            <p className="m-0 text-sm text-[#6b7280] font-medium">{stat.label}</p>
          </article>
        ))}
      </div>
    </section>
  );
};

export default StatsSection;
