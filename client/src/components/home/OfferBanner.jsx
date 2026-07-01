import React, { useState, useEffect } from "react";
import img1 from "../../assets/Gemini_Generated_Image_jw1u3vjw1u3vjw1u.jfif";

const images = [img1];

const OfferBanner = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 4000); // Change image every 4 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <section style={{ background: "#FAF7F0" }}>
      <div className="section-wrap">
        <div 
          className="relative w-full mx-auto rounded-[2rem] overflow-hidden shadow-2xl group cursor-pointer"
          style={{ 
            height: "clamp(300px, 40vh, 550px)",
            transformStyle: "preserve-3d",
            perspective: "1200px"
          }}
        >
          {/* Inner container for 3D effect */}
          <div className="absolute inset-0 w-full h-full transition-transform duration-500 ease-out group-hover:scale-[1.02] group-hover:rotate-x-2 group-hover:-rotate-y-2">
            {images.map((src, index) => (
              <img
                key={index}
                src={src}
                alt={`Offer ${index + 1}`}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
                  index === currentIndex ? "opacity-100" : "opacity-0"
                }`}
              />
            ))}
            
            {/* Overlay gradient for better text visibility if we want to add text, or just for style */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-50" />
            
            {/* Optional glowing border effect */}
            <div className="absolute inset-0 border border-white/20 rounded-3xl pointer-events-none" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default OfferBanner;
