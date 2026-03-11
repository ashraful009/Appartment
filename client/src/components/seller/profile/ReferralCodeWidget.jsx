import React, { useState } from "react";
import { Target, CheckCheck, Copy } from "lucide-react";

const ReferralCodeWidget = ({ referralCode }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!referralCode) return;
    try {
      await navigator.clipboard.writeText(referralCode);
    } catch {
      const el = document.createElement("textarea");
      el.value = referralCode;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-gray-900 rounded-2xl border border-gray-800 shadow-xl overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-800">
        <h3 className="text-[10px] font-bold tracking-widest uppercase text-gray-400 flex items-center gap-2">
          <Target size={12} className="text-amber-400" />
          My Affiliate Code
        </h3>
      </div>
      <div className="p-6">
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-black rounded-xl p-4 flex items-center justify-center border border-gray-800">
            <span className="text-3xl font-mono tracking-[0.2em] font-extrabold text-amber-300">
              {referralCode || "----"}
            </span>
          </div>
          <button
            onClick={handleCopy}
            title="Copy to clipboard"
            className="w-16 h-[74px] flex flex-col items-center justify-center gap-1 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-xl transition-colors border border-gray-700"
          >
            {copied ? <CheckCheck size={20} className="text-emerald-400" /> : <Copy size={20} />}
            <span className="text-[10px] font-bold uppercase">{copied ? "Copied" : "Copy"}</span>
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-4 text-center">
          Share this uniquely generated code with your network so they can enlist you as their agent when they register.
        </p>
      </div>
    </div>
  );
};

export default ReferralCodeWidget;
