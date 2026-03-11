import React, { useState } from "react";
import { SlidersHorizontal, X, MapPin, DollarSign, SquareArrowUpRight } from "lucide-react";

const LOCATIONS = ["Gulshan", "Banani", "Dhanmondi", "Mirpur", "Uttara", "Bashundhara", "Motijheel"];
const PRICE_RANGES = ["Under ৳50L", "৳50L – ৳1Cr", "৳1Cr – ৳2Cr", "৳2Cr – ৳5Cr", "Above ৳5Cr"];
const SIZE_RANGES  = ["Under 800 sft", "800–1200 sft", "1200–1800 sft", "1800–2500 sft", "Above 2500 sft"];

const FilterSection = ({ title, icon: Icon, options, selected, onToggle }) => (
  <div className="mb-6">
    <div className="flex items-center gap-2 mb-3">
      <Icon size={15} className="text-brand-500" />
      <h3 className="text-xs font-bold text-gray-600 uppercase tracking-widest">{title}</h3>
    </div>
    <div className="space-y-1.5">
      {options.map((opt) => (
        <label key={opt} className="flex items-center gap-2.5 cursor-pointer group">
          <div
            onClick={() => onToggle(opt)}
            className={`w-4 h-4 rounded flex items-center justify-center border-2 transition-colors flex-shrink-0 ${
              selected.includes(opt)
                ? "bg-brand-600 border-brand-600"
                : "border-gray-300 group-hover:border-brand-400"
            }`}
          >
            {selected.includes(opt) && (
              <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 8" fill="none">
                <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
          <span className={`text-sm transition-colors ${selected.includes(opt) ? "text-brand-700 font-medium" : "text-gray-600 group-hover:text-gray-800"}`}>
            {opt}
          </span>
        </label>
      ))}
    </div>
  </div>
);

const FilterSidebar = ({ onFilter }) => {
  const [open, setOpen]         = useState(false); // mobile drawer
  const [locations, setLoc]     = useState([]);
  const [prices, setPrices]     = useState([]);
  const [sizes, setSizes]       = useState([]);

  const toggle = (setter, val) =>
    setter((prev) => prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]);

  const clearAll = () => { setLoc([]); setPrices([]); setSizes([]); };
  const totalActive = locations.length + prices.length + sizes.length;

  const SidebarContent = () => (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={17} className="text-brand-600" />
          <h2 className="font-bold text-gray-800">Filters</h2>
          {totalActive > 0 && (
            <span className="bg-brand-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">{totalActive}</span>
          )}
        </div>
        {totalActive > 0 && (
          <button onClick={clearAll} className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1">
            <X size={12} /> Clear all
          </button>
        )}
      </div>

      <FilterSection title="Location"   icon={MapPin}              options={LOCATIONS}    selected={locations} onToggle={(v) => toggle(setLoc, v)} />
      <FilterSection title="Price"      icon={DollarSign}          options={PRICE_RANGES}  selected={prices}    onToggle={(v) => toggle(setPrices, v)} />
      <FilterSection title="Size"       icon={SquareArrowUpRight}  options={SIZE_RANGES}   selected={sizes}     onToggle={(v) => toggle(setSizes, v)} />
    </div>
  );

  return (
    <>
      {/* ── Mobile trigger button ─────────────────────────────────── */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed bottom-6 left-6 z-30 flex items-center gap-2 bg-brand-600 text-white px-4 py-2.5 rounded-full shadow-xl text-sm font-semibold"
      >
        <SlidersHorizontal size={16} />
        Filters{totalActive > 0 && ` (${totalActive})`}
      </button>

      {/* ── Mobile drawer backdrop ────────────────────────────────── */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative z-50 w-72 bg-white h-full overflow-y-auto p-6 shadow-2xl">
            <button onClick={() => setOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700">
              <X size={20} />
            </button>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* ── Desktop sidebar ───────────────────────────────────────── */}
      <aside className="hidden lg:block w-1/4 flex-shrink-0">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-6">
          <SidebarContent />
        </div>
      </aside>
    </>
  );
};

export default FilterSidebar;
