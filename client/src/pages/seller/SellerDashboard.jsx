import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { Copy, CheckCheck } from "lucide-react";

// ── Referral Code Card ────────────────────────────────────────────────────────
const ReferralCodeCard = ({ userId }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(userId);
    } catch {
      const el = document.createElement("textarea");
      el.value = userId;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 mb-8 shadow-lg relative overflow-hidden">
      <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-amber-500/10" />
      <div className="absolute -right-2 -top-8 w-24 h-24 rounded-full bg-amber-500/5" />

      <div className="relative">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Your Referral Code</p>
        <p className="text-sm text-gray-300 mb-4">Share this code so new users are auto-assigned to you.</p>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-gray-950/60 border border-gray-700 rounded-xl px-4 py-3 min-w-0">
            <p className="font-mono text-sm text-amber-300 truncate select-all tracking-wide">
              {userId}
            </p>
          </div>
          <button
            onClick={handleCopy}
            className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
              copied
                ? "bg-emerald-500 text-white"
                : "bg-amber-500 hover:bg-amber-400 text-gray-900"
            }`}
          >
            {copied ? <><CheckCheck size={15} /> Copied!</> : <><Copy size={15} /> Copy</>}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main ──────────────────────────────────────────────────────────────────────
const SellerDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="p-8">
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Seller Panel</p>
        <h1 className="text-3xl font-extrabold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          Welcome back, {user?.name}! Share your referral code to grow your leads.
        </p>
      </div>

      {/* Referral Code — the only card kept as per Task-2 requirement */}
      {user?._id && <ReferralCodeCard userId={user._id} />}
    </div>
  );
};

export default SellerDashboard;
