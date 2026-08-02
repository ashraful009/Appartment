import React, { useState } from "react";
import { X } from "lucide-react";

const TIERS = [
  {
    badge: "Bronze",
    amount: "৳১ লক্ষ",
    label: "Suitable Business Opportunities",
    highlighted: false,
    list: ["Community Bond", "EV Charging Share", "Coffee Shop Share"],
  },
  {
    badge: "Silver",
    amount: "৳২ লক্ষ",
    label: "Suitable Business Opportunities",
    highlighted: false,
    list: ["Laundry Service", "Printing Center", "Stationery Shop"],
  },
  {
    badge: "Gold",
    amount: "৳৫ লক্ষ",
    label: "Suitable Business Opportunities",
    highlighted: true,
    list: ["Pharmacy", "Bakery", "Day Care Center"],
  },
  {
    badge: "Platinum",
    amount: "৳১০ লক্ষ",
    label: "Suitable Business Opportunities",
    highlighted: true,
    list: ["Coffee Shop", "Coworking Space", "Health Clinic"],
  },
  {
    badge: "Diamond",
    amount: "৳২০ লক্ষ",
    label: "Suitable Business Opportunities",
    highlighted: false,
    list: ["Swimming Pool", "Fitness Gym", "Community Hall"],
  },
  {
    badge: "Crown",
    amount: "৳৫০ লক্ষ+",
    label: "Suitable Business Opportunities",
    highlighted: false,
    list: ["Super Shop", "Restaurant", "Mini Convention Hall"],
  },
];

const ProjectCategories = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <section className="w-[min(1600px,calc(100%-4rem))] mx-auto mb-16 p-8 lg:p-12 bg-white border border-[rgba(37,99,235,0.12)] rounded-[32px] shadow-[0_20px_45px_rgba(15,23,42,0.12)]" id="project-categories">
      <div className="text-center mb-10">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#dbeafe] text-[#2563eb] text-xs font-bold uppercase tracking-wider mb-3">
          Project Categories
        </span>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-[#1e3a8a]">
          Explore Dar Al Aman opportunities
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <article className="bg-[#f5f7fb] border border-[rgba(37,99,235,0.16)] rounded-[24px] p-6 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_18px_40px_rgba(15,23,42,0.12)]">
          <button
            onClick={() => setShowModal(true)}
            className="flex flex-col items-start w-full text-left bg-transparent border-0 cursor-pointer"
            type="button"
          >
            <span className="text-xl font-bold text-[#1e3a8a] mb-2">Investment</span>
            <span className="text-sm text-[#6b7280]">
              বিনিয়োগের মাত্রা এবং উপযুক্ত ব্যবসায়িক সুযোগ।
            </span>
          </button>
        </article>

        
        <article className="bg-[#f5f7fb] border border-[rgba(37,99,235,0.16)] rounded-[24px] p-6 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_18px_40px_rgba(15,23,42,0.12)]">
          <a className="flex flex-col items-start w-full text-left" href="#">
            <span className="text-xl font-bold text-[#1e3a8a] mb-2">Condominium City</span>
            <span className="text-sm text-[#6b7280]">Dedicated condominium city details page.</span>
          </a>
        </article>

        
        <article className="bg-[#f5f7fb] border border-[rgba(37,99,235,0.16)] rounded-[24px] p-6 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_18px_40px_rgba(15,23,42,0.12)]">
          <button className="flex flex-col items-start w-full text-left bg-transparent border-0 cursor-pointer" type="button">
            <span className="text-xl font-bold text-[#1e3a8a] mb-2">Studio</span>
            <span className="text-sm text-[#6b7280]">Studio apartment information will be added here.</span>
          </button>
        </article>

        
        <article className="bg-[#f5f7fb] border border-[rgba(37,99,235,0.16)] rounded-[24px] p-6 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_18px_40px_rgba(15,23,42,0.12)]">
          <button className="flex flex-col items-start w-full text-left bg-transparent border-0 cursor-pointer" type="button">
            <span className="text-xl font-bold text-[#1e3a8a] mb-2">Business</span>
            <span className="text-sm text-[#6b7280]">Business and shop information will be added here.</span>
          </button>
        </article>
      </div>

      
      {showModal && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div
            className="fixed inset-0"
            onClick={() => setShowModal(false)}
          />
          <div className="relative z-10 w-full max-w-4xl max-h-[90vh] bg-white rounded-[24px] p-6 sm:p-8 overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
              <h3 className="text-xl font-extrabold text-[#1e3a8a]">Investment Levels</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                type="button"
                aria-label="Close modal"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              <h3 className="text-lg font-bold text-center text-[#1e3a8a] mb-4">
                বিনিয়োগের স্তর (Investment Levels)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {TIERS.map((tier, idx) => (
                  <div
                    key={idx}
                    className={`p-6 rounded-[20px] border transition-all ${
                      tier.highlighted
                        ? "bg-[#dbeafe]/40 border-[#2563eb] shadow-md ring-2 ring-[#2563eb]/20"
                        : "bg-[#f5f7fb] border-[rgba(37,99,235,0.16)]"
                    }`}
                  >
                    <div className="inline-block px-3 py-1 bg-[#2563eb] text-white text-xs font-bold rounded-full mb-3">
                      {tier.badge}
                    </div>
                    <h4 className="text-2xl font-extrabold text-[#1e3a8a] mb-1">{tier.amount}</h4>
                    <p className="text-xs text-[#6b7280] font-medium mb-4">{tier.label}</p>
                    <ul className="space-y-2 text-sm text-[#1f2937]">
                      {tier.list.map((item, itemIdx) => (
                        <li key={itemIdx} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#2563eb]" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ProjectCategories;
