import React, { useState } from "react";
import { X, ChevronDown } from "lucide-react";

const CATEGORIES = [
  {
    title: "Food & Beverage",
    items: [
      { num: 1, name: "Coffee Shop" },
      { num: 2, name: "Restaurant" },
      { num: 3, name: "Food Court" },
      { num: 4, name: "Bakery" },
      { num: 5, name: "Tea Lounge" },
      { num: 6, name: "Juice Bar" },
      { num: 7, name: "Ice Cream Shop" },
      { num: 8, name: "Fast Food Outlet" },
      { num: 9, name: "Organic Food Store" },
      { num: 10, name: "Fruit Shop" },
      { num: 11, name: "Sweet Shop" },
      { num: 12, name: "Pizza Corner" },
      { num: 13, name: "BBQ Corner" },
      { num: 14, name: "Rooftop Café" },
      { num: 15, name: "Home Kitchen Delivery" },
    ],
  },
  {
    title: "Retail Business",
    items: [
      { num: 16, name: "Mini Super Shop" },
      { num: 17, name: "Pharmacy" },
      { num: 18, name: "Stationery Shop" },
      { num: 19, name: "Mobile Shop" },
      { num: 20, name: "Computer Shop" },
      { num: 21, name: "Electronics Store" },
      { num: 22, name: "Furniture Shop" },
      { num: 23, name: "Gift Shop" },
      { num: 24, name: "Book Store" },
      { num: 25, name: "Flower Shop" },
      { num: 26, name: "Toy Shop" },
      { num: 27, name: "Baby Shop" },
      { num: 28, name: "Pet Shop" },
      { num: 29, name: "Fashion Boutique" },
      { num: 30, name: "Sports Shop" },
    ],
  },
  {
    title: "Health & Wellness",
    items: [
      { num: 31, name: "Clinic" },
      { num: 32, name: "Diagnostic Center" },
      { num: 33, name: "Dental Clinic" },
      { num: 34, name: "Eye Care" },
      { num: 35, name: "Physiotherapy" },
      { num: 36, name: "Gym" },
      { num: 37, name: "Yoga Studio" },
      { num: 38, name: "Spa & Massage" },
      { num: 39, name: "Beauty Salon" },
      { num: 40, name: "Nutrition Center" },
    ],
  },
  {
    title: "Education",
    items: [
      { num: 41, name: "Day Care" },
      { num: 42, name: "Play School" },
      { num: 43, name: "Tuition Center" },
      { num: 44, name: "English Language Center" },
      { num: 45, name: "Robotics Lab" },
      { num: 46, name: "Coding School" },
      { num: 47, name: "Art School" },
      { num: 48, name: "Music School" },
      { num: 49, name: "Library" },
      { num: 50, name: "Training Center" },
    ],
  },
  {
    title: "Smart Community",
    items: [
      { num: 51, name: "Coworking Space" },
      { num: 52, name: "Business Lounge" },
      { num: 53, name: "Meeting Room" },
      { num: 54, name: "Podcast Studio" },
      { num: 55, name: "Photography Studio" },
      { num: 56, name: "Printing Center" },
      { num: 57, name: "IT Support Center" },
      { num: 58, name: "WiFi Service" },
      { num: 59, name: "Community App" },
      { num: 60, name: "Community Marketplace" },
    ],
  },
  {
    title: "Sports & Recreation",
    items: [
      { num: 61, name: "Swimming Pool" },
      { num: 62, name: "Indoor Games" },
      { num: 63, name: "Kids Zone" },
      { num: 64, name: "Outdoor Playground" },
      { num: 65, name: "Walking Track" },
      { num: 66, name: "Cycling Club" },
      { num: 67, name: "Tennis Court" },
      { num: 68, name: "Basketball Court" },
      { num: 69, name: "Football Turf" },
      { num: 70, name: "Mini Cinema" },
    ],
  },
  {
    title: "Home Services",
    items: [
      { num: 71, name: "Laundry" },
      { num: 72, name: "House Cleaning" },
      { num: 73, name: "Electrician Service" },
      { num: 74, name: "Plumbing Service" },
      { num: 75, name: "Interior Design" },
      { num: 76, name: "Pest Control" },
      { num: 77, name: "Gardening Service" },
      { num: 78, name: "AC Service" },
      { num: 79, name: "Car Wash" },
      { num: 80, name: "Moving Service" },
    ],
  },
  {
    title: "Green & Sustainable",
    items: [
      { num: 81, name: "Solar Power" },
      { num: 82, name: "Water Treatment" },
      { num: 83, name: "Rainwater Harvesting" },
      { num: 84, name: "Waste Recycling" },
      { num: 85, name: "Organic Compost" },
      { num: 86, name: "Tree Nursery" },
      { num: 87, name: "EV Charging" },
      { num: 88, name: "Battery Charging" },
      { num: 89, name: "Smart Energy Monitoring" },
      { num: 90, name: "Green Building Consultancy" },
    ],
  },
  {
    title: "Finance & Digital",
    items: [
      { num: 91, name: "Agent Banking" },
      { num: 92, name: "ATM Booth" },
      { num: 93, name: "Insurance Desk" },
      { num: 94, name: "Digital Payment Center" },
      { num: 95, name: "Investment Advisory Desk" },
    ],
  },
  {
    title: "Premium & Future Expansion",
    items: [
      { num: 96, name: "Telemedicine Center" },
      { num: 97, name: "Electric Shuttle Service" },
      { num: 98, name: "Rooftop Restaurant" },
      { num: 99, name: "Mini Convention Hall" },
      { num: 100, name: "Community Business Incubator" },
    ],
  },
];

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

const InvestmentSection = () => {
  const [activeModalCat, setActiveModalCat] = useState(null);

  return (
    <section className="w-[min(1600px,calc(100%-4rem))] mx-auto mb-16 p-8 lg:p-12 bg-gradient-to-br from-white/95 to-[#dbeafe]/40 border border-[rgba(37,99,235,0.12)] rounded-[32px] shadow-[0_20px_45px_rgba(15,23,42,0.12)]" id="investment">
      
      <div className="text-center mb-12 max-w-4xl mx-auto">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#dbeafe] text-[#2563eb] text-xs font-bold uppercase tracking-wider mb-3">
          Community Investment
        </span>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-[#1e3a8a] mb-2">
          Dar Al Aman – Community Investment City
        </h2>
        <p className="text-[#2563eb] font-semibold text-base sm:text-lg mb-3">
          Nirapad Nibash Ltd. – Community Owned Housing &amp; Lifestyle Ecosystem
        </p>
        <p className="text-[#6b7280] text-sm sm:text-base leading-relaxed">
          এই ক্যাটালগের উদ্দেশ্য হলো এমন একটি আবাসন কমিউনিটি তৈরি করা, যেখানে শুধুমাত্র ফ্ল্যাটের মালিক নয়, বরং সাধারণ মানুষও ছোট ছোট ব্যবসা ও সেবায় বিনিয়োগ করে অংশীদার হতে পারবেন।
        </p>
      </div>

      
      <div className="mb-16">
        <h3 className="text-xl sm:text-2xl font-extrabold text-[#1e3a8a] text-center mb-8">
          ১০০টি ক্ষুদ্র বিনিয়োগ সুযোগের ক্যাটালগ
        </h3>

        <div className="space-y-4">
          {CATEGORIES.map((cat, idx) => (
            <details
              key={idx}
              className="group bg-white border border-[rgba(37,99,235,0.16)] rounded-[20px] overflow-hidden shadow-sm transition-all"
            >
              <summary
                onClick={(e) => {
                  e.preventDefault();
                  setActiveModalCat(cat);
                }}
                className="flex items-center justify-between p-5 cursor-pointer hover:bg-[#f5f7fb] transition-colors select-none"
              >
                <span className="text-lg font-bold text-[#1e3a8a]">
                  {cat.title}
                </span>
                <span className="text-xs font-bold px-3 py-1 bg-[#dbeafe] text-[#2563eb] rounded-full group-hover:bg-[#2563eb] group-hover:text-white transition-colors">
                  View Items ({cat.items.length})
                </span>
              </summary>
              <div className="p-5 border-t border-gray-100 bg-[#f5f7fb]/50">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
                  {cat.items.map((item) => (
                    <div
                      key={item.num}
                      className="flex items-center gap-2.5 p-3 bg-white border border-gray-200/80 rounded-xl text-sm font-semibold text-[#1f2937]"
                    >
                      <span className="inline-grid place-items-center w-6 h-6 rounded-full bg-[#dbeafe] text-[#2563eb] text-xs font-bold flex-shrink-0">
                        {item.num}
                      </span>
                      <span className="truncate">{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </details>
          ))}
        </div>
      </div>

      
      {activeModalCat && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="fixed inset-0" onClick={() => setActiveModalCat(null)} />
          <div className="relative z-10 w-full max-w-3xl max-h-[85vh] bg-white rounded-[24px] p-6 sm:p-8 overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
              <h3 className="text-xl font-extrabold text-[#1e3a8a]">
                {activeModalCat.title}
              </h3>
              <button
                onClick={() => setActiveModalCat(null)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                type="button"
              >
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {activeModalCat.items.map((item) => (
                <div
                  key={item.num}
                  className="flex items-center gap-3 p-3.5 bg-[#f5f7fb] border border-[rgba(37,99,235,0.16)] rounded-xl text-sm font-bold text-[#1f2937]"
                >
                  <span className="inline-grid place-items-center w-7 h-7 rounded-full bg-[#2563eb] text-white text-xs font-bold flex-shrink-0">
                    {item.num}
                  </span>
                  <span>{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      
      <div id="investmentLevelsContent">
        <h3 className="text-xl sm:text-2xl font-extrabold text-[#1e3a8a] text-center mb-8">
          বিনিয়োগের স্তর (Investment Levels)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {TIERS.map((tier, idx) => (
            <div
              key={idx}
              className={`p-6 rounded-[24px] border transition-all duration-300 hover:-translate-y-1 ${
                tier.highlighted
                  ? "bg-white border-[#2563eb] shadow-xl ring-2 ring-[#2563eb]/20"
                  : "bg-white/80 border-[rgba(37,99,235,0.16)] shadow-md"
              }`}
            >
              <div className="inline-block px-3.5 py-1 bg-[#2563eb] text-white text-xs font-bold rounded-full mb-3">
                {tier.badge}
              </div>
              <h4 className="text-3xl font-extrabold text-[#1e3a8a] mb-1">{tier.amount}</h4>
              <p className="text-xs text-[#6b7280] font-medium mb-4">{tier.label}</p>
              <ul className="space-y-2.5 text-sm font-medium text-[#1f2937]">
                {tier.list.map((item, itemIdx) => (
                  <li key={itemIdx} className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#2563eb]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default InvestmentSection;
