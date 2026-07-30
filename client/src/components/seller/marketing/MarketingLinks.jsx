import React, { useState, useEffect } from "react";
import axios from "axios";
import { Copy, CheckCircle, ExternalLink, Share2, Sparkles, Loader2 } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

const MarketingLinks = () => {
  const { user: authUser } = useAuth();
  const [referralCode, setReferralCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchCode = async () => {
      if (authUser?.referralCode || authUser?.referral_code) {
        setReferralCode(authUser.referralCode || authUser.referral_code);
        setLoading(false);
        return;
      }
      try {
        const { data } = await axios.get("/api/users/profile", { withCredentials: true });
        if (data?.user?.referralCode || data?.user?.referral_code) {
          setReferralCode(data.user.referralCode || data.user.referral_code);
        }
      } catch (err) {
        console.error("Failed to load seller referral code", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCode();
  }, [authUser]);

  const referralLink = referralCode ? `${window.location.origin}/?ref=${referralCode}` : "";

  const handleCopy = () => {
    if (referralLink) {
      navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
          <Share2 className="text-brand-600" size={32} />
          Personal Marketing Link
        </h1>
        <p className="text-gray-500 text-sm mt-2">
          Your permanent, unique referral link for the entire platform. Share it with clients or post it on social media.
        </p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Sparkles size={20} className="text-amber-500" />
              Your Shareable Website Link
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Anyone visiting the platform through this link will be automatically tracked for 30 days.
            </p>
          </div>
          {referralCode && (
            <span className="px-3 py-1 bg-brand-100 text-brand-800 font-mono font-bold text-xs rounded-full border border-brand-200">
              Code: {referralCode}
            </span>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-8 text-gray-400">
            <Loader2 size={24} className="animate-spin mr-2" /> Loading your unique link...
          </div>
        ) : !referralCode ? (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm">
            Referral code not available. Please refresh or update your profile.
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <input
                type="text"
                readOnly
                value={referralLink}
                className="flex-1 px-4 py-3.5 border border-gray-300 rounded-2xl bg-gray-50 text-gray-800 font-mono text-sm focus:outline-none select-all"
              />
              <button
                onClick={handleCopy}
                className="px-6 py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-2xl transition-colors flex items-center justify-center gap-2 shadow-md shadow-brand-200"
              >
                {copied ? <CheckCircle size={18} className="text-green-300" /> : <Copy size={18} />}
                {copied ? "Copied Link!" : "Copy Link"}
              </button>
              <a
                href={referralLink}
                target="_blank"
                rel="noreferrer"
                className="p-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl transition-colors flex items-center justify-center"
                title="Preview Link"
              >
                <ExternalLink size={20} />
              </a>
            </div>
            {copied && <p className="text-xs text-green-600 font-semibold mt-1">✓ Referral link copied to clipboard!</p>}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 space-y-2">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg">1</div>
          <h3 className="font-bold text-gray-900 text-base">Share Your Link</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            Share your link on Facebook, WhatsApp, LinkedIn, or directly with interested customers.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 space-y-2">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-lg">2</div>
          <h3 className="font-bold text-gray-900 text-base">Customer Browses Site</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            When a customer clicks your link, they land directly on our homepage and can explore all available properties.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 space-y-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg">3</div>
          <h3 className="font-bold text-gray-900 text-base">Automatic Lead Assignment</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            If the customer submits a price request on any property, the lead is automatically assigned directly to your panel!
          </p>
        </div>
      </div>
    </div>
  );
};

export default MarketingLinks;
