import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import toastImg from "../../assets/toast.jpeg";

const ToastPopup = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasClosed, setHasClosed] = useState(false);

  useEffect(() => {
    // Only trigger once after 5 seconds
    if (hasClosed) return;
    
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [hasClosed]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in" style={{ backgroundColor: "rgba(0, 0, 0, 0.6)", backdropFilter: "blur(4px)" }}>
      <div className="relative bg-white rounded-2xl overflow-hidden shadow-2xl max-w-2xl w-full animate-fade-up border border-white/20">
        <button
          onClick={() => {
            setIsVisible(false);
            setHasClosed(true);
          }}
          className="absolute top-3 right-3 bg-white/90 hover:bg-white text-gray-800 p-1.5 rounded-full shadow-md transition-all z-10"
          aria-label="Close popup"
        >
          <X size={20} />
        </button>
        <img src={toastImg} alt="Special Promotion" className="w-full h-auto block" />
      </div>
    </div>
  );
};

export default ToastPopup;
