import React from "react";
import areaImg from "../../assets/area.jpeg";
import area1Img from "../../assets/area1.jpeg";
import area2Img from "../../assets/area2.jpeg";
import area3Img from "../../assets/area3.jpeg";
import area4Img from "../../assets/area4.jpeg";

const images = [
  { src: areaImg, alt: "Property area view" },
  { src: area1Img, alt: "Property area view 1" },
  { src: area2Img, alt: "Property area view 2" },
  { src: area3Img, alt: "Property area view 3" },
  { src: area4Img, alt: "Property area view 4" },
];

const features = [
  "Premium Locations",
  "Secure Community",
  "Affordable Price",
  "24/7 Support",
];

const PropertySection = () => {
  return (
    <section className="w-[min(1600px,calc(100%-4rem))] mx-auto mb-16 p-8 lg:p-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center bg-gradient-to-br from-white/95 to-[#dbeafe]/50 border border-[rgba(37,99,235,0.12)] rounded-[32px] shadow-[0_20px_45px_rgba(15,23,42,0.12)]" id="properties">
      <style>{`
        @keyframes propertySlideAnimation {
          0% { opacity: 0; transform: translateX(100%); }
          5%, 18% { opacity: 1; transform: translateX(0); }
          23% { opacity: 0; transform: translateX(-100%); }
          24%, 100% { opacity: 0; transform: translateX(100%); }
        }
        .animate-property-slide {
          animation: propertySlideAnimation 20s infinite;
        }
      `}</style>

      <div className="space-y-4" id="about">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#dbeafe] text-[#2563eb] text-xs font-bold uppercase tracking-wider">
          Property View
        </span>
        <h2 className="text-3xl lg:text-5xl font-extrabold text-[#1f2937] leading-[1.1]">
          Elevated living in thoughtfully designed communities.
        </h2>
        <p className="text-[#6b7280] text-base leading-relaxed">
          From high-rise residences to serene villas, every Nirapad Nibash
          property is planned to deliver comfort, security, and modern luxury.
        </p>

        <ul className="space-y-3 my-6">
          {features.map((feature, idx) => (
            <li key={idx} className="flex items-center gap-2.5 font-semibold text-[#1f2937]">
              <span className="inline-grid place-items-center w-5 h-5 rounded-full bg-[#dbeafe] text-[#2563eb] text-xs font-extrabold">
                ✓
              </span>
              {feature}
            </li>
          ))}
        </ul>

        <a
          href="#footer"
          className="inline-flex items-center justify-center px-6 py-3.5 rounded-2xl font-bold text-white bg-gradient-to-br from-[#2563eb] to-[#3b82f6] shadow-[0_14px_28px_rgba(37,99,235,0.2)] hover:-translate-y-1 hover:shadow-[0_14px_30px_rgba(37,99,235,0.25)] transition-all duration-300"
        >
          View Details
        </a>
      </div>

      <div className="relative w-full aspect-[3/2] overflow-hidden rounded-[24px] shadow-[0_16px_42px_rgba(15,23,42,0.14)] hover:scale-[1.02] transition-transform duration-350" aria-label="Property area image slider">
        {images.map((img, idx) => (
          <img
            key={idx}
            className="absolute inset-0 w-full h-full object-cover opacity-0 animate-property-slide"
            style={{ animationDelay: `${idx * 4}s` }}
            src={img.src}
            alt={img.alt}
          />
        ))}
      </div>
    </section>
  );
};

export default PropertySection;
