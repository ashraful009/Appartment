import React from "react";



const C = {
  navy:      "#0A1628",
  navyMid:   "#122040",
  navyLight: "#1A3060",
  gold:      "#C9942A",
  ivory:     "#FAF7F0",
};


export const PropertyCardSkeleton = () => (
  <div
    className="skeleton-card w-full rounded-3xl overflow-hidden relative"
    style={{ height: "clamp(180px, 30vw, 460px)" }}
  >
    
    <div className="skeleton-shimmer absolute inset-0" />

    
    <div
      className="absolute inset-x-0 bottom-0 p-3 sm:p-4 flex flex-col gap-2"
      style={{ background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)" }}
    >
      
      <div
        className="skeleton-shimmer rounded-md"
        style={{ height: "14px", width: "65%", opacity: 0.45 }}
      />
      
      <div
        className="skeleton-shimmer rounded-md"
        style={{ height: "10px", width: "45%", opacity: 0.35 }}
      />
      
      <div className="flex gap-2 mt-1">
        {[48, 56, 40].map((w, i) => (
          <div
            key={i}
            className="skeleton-shimmer rounded-full"
            style={{ height: "16px", width: `${w}px`, opacity: 0.3 }}
          />
        ))}
      </div>
    </div>
  </div>
);


export const PropertyGridSkeleton = ({ count = 6 }) => (
  <div className="w-full">
    
    <div className="flex items-center justify-between mb-5">
      <div
        className="skeleton-shimmer rounded-md"
        style={{ height: "14px", width: "140px", background: "rgba(10,22,40,0.08)" }}
      />
    </div>
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5 lg:gap-8 w-full">
      {[...Array(count)].map((_, i) => (
        <PropertyCardSkeleton key={i} />
      ))}
    </div>
  </div>
);


export const HeroSkeleton = () => (
  <div
    className="w-full relative overflow-hidden flex items-center justify-center"
    style={{
      minHeight: "clamp(320px, 60vw, 740px)",
      background: "linear-gradient(135deg, #040810 0%, #0A1628 40%, #122040 100%)",
    }}
  >
    
    <div className="hero-shimmer-overlay" />

    
    <div
      className="absolute pointer-events-none"
      style={{
        top: "-20%", left: "-10%",
        width: "55%", height: "70%",
        background: "radial-gradient(ellipse, rgba(26,48,96,0.5) 0%, transparent 70%)",
        filter: "blur(60px)",
      }}
    />
    <div
      className="absolute pointer-events-none"
      style={{
        bottom: "-20%", right: "-10%",
        width: "50%", height: "60%",
        background: "radial-gradient(ellipse, rgba(201,148,42,0.18) 0%, transparent 70%)",
        filter: "blur(50px)",
      }}
    />

    
    <div className="relative z-10 flex flex-col items-center gap-5 px-6" style={{ maxWidth: "600px", width: "100%" }}>
      
      <div
        className="skeleton-shimmer-dark rounded-full"
        style={{ height: "28px", width: "220px" }}
      />
      
      <div className="flex flex-col items-center gap-3 w-full">
        <div className="skeleton-shimmer-dark rounded-lg" style={{ height: "clamp(28px,5vw,52px)", width: "80%" }} />
        <div className="skeleton-shimmer-dark rounded-lg" style={{ height: "clamp(28px,5vw,52px)", width: "65%" }} />
      </div>
      
      <div className="flex flex-col items-center gap-2 w-full mt-2">
        <div className="skeleton-shimmer-dark rounded-md" style={{ height: "14px", width: "70%" }} />
        <div className="skeleton-shimmer-dark rounded-md" style={{ height: "14px", width: "55%" }} />
      </div>
      
      <div className="flex gap-4 mt-4">
        <div className="skeleton-shimmer-gold rounded-xl" style={{ height: "44px", width: "160px" }} />
        <div className="skeleton-shimmer-dark rounded-xl" style={{ height: "44px", width: "160px", border: "1px solid rgba(201,148,42,0.3)" }} />
      </div>
    </div>

    
    <div
      className="absolute bottom-0 left-0 right-0 pointer-events-none"
      style={{ height: "80px", background: "linear-gradient(to bottom, transparent, rgba(250,247,240,1))" }}
    />
  </div>
);


export const GenericSkeleton = ({ height = "20px", width = "100%", radius = "8px", dark = false, className = "" }) => (
  <div
    className={`${dark ? "skeleton-shimmer-dark" : "skeleton-shimmer"} ${className}`}
    style={{ height, width, borderRadius: radius }}
  />
);

export default PropertyGridSkeleton;
