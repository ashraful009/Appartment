import React, { useEffect, useState } from "react";
import axios from "axios";
import { X, Mail, Phone, ExternalLink, Linkedin } from "lucide-react";
import { formatDate } from "../../../utils/helpers";

/**
 * Seller Profile Modal — read-only "Digital Visiting Card".
 *
 * Props:
 *  - sellerId     {string}  MongoDB _id for the seller (used to lazy-fetch full profile)
 *  - sellerBasic  {object}  Minimal seller data (name, email, phone) — shown while loading
 *  - approvedCount {number} From the sellers-performance response
 *  - pendingCount  {number} From the sellers-performance response
 *  - onClose      {fn}      Called when backdrop or X is clicked
 */
const SellerProfileModal = ({
  sellerId,
  sellerBasic,
  approvedCount,
  pendingCount,
  onClose,
}) => {
  const [profile, setProfile]   = useState(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!sellerId) return;
    setFetching(true);
    axios
      .get(`/api/admin/users/${sellerId}`, { withCredentials: true })
      .then(({ data }) => setProfile(data.user))
      .catch(() => setProfile(sellerBasic))   // fallback to minimal data
      .finally(() => setFetching(false));
  }, [sellerId]);

  const u = profile ?? sellerBasic;

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Close Button ── */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/20 hover:bg-white/40
                     backdrop-blur-sm flex items-center justify-center transition-colors border border-white/30"
        >
          <X size={15} className="text-white" />
        </button>

        {/* ── Section 1: Header ── */}
        <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 px-8 pt-8 pb-10">
          {fetching ? (
            <div className="flex items-center gap-5 animate-pulse">
              <div className="w-24 h-24 rounded-full bg-white/20 flex-shrink-0" />
              <div className="space-y-3 flex-1">
                <div className="h-6 bg-white/20 rounded w-48" />
                <div className="h-4 bg-white/15 rounded w-36" />
                <div className="h-4 bg-white/15 rounded w-32" />
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              {/* Photo */}
              {u?.profilePhoto ? (
                <img
                  src={u.profilePhoto}
                  alt={u.name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-blue-50 shadow-lg flex-shrink-0"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-white/20 text-white font-black text-4xl
                                flex items-center justify-center border-4 border-white/30 flex-shrink-0">
                  {u?.name?.[0]?.toUpperCase() ?? "?"}
                </div>
              )}

              {/* Identity */}
              <div className="min-w-0 flex-1">
                <h2 className="text-3xl font-bold text-white truncate">{u?.name}</h2>
                <p className="text-indigo-200 text-xs font-medium mt-1">
                  Joined: {formatDate(u?.memberSince ?? u?.createdAt)}
                </p>
                {u?.email && (
                  <a href={`mailto:${u.email}`}
                    className="flex items-center gap-1.5 text-indigo-200 text-sm hover:text-white transition-colors mt-2">
                    <Mail size={13} /> {u.email}
                  </a>
                )}
                {u?.phone && (
                  <a href={`tel:${u.phone}`}
                    className="flex items-center gap-1.5 text-indigo-200 text-sm hover:text-white transition-colors mt-1">
                    <Phone size={13} /> {u.phone}
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Sections 2 & 3: Body ── */}
        <div className="p-6 md:p-8 space-y-6">
          {fetching ? (
            <div className="space-y-4 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-100 rounded-xl" />
              ))}
            </div>
          ) : (
            <>
              {/* ── Section 2: Professional Details ── */}

              {/* Bio */}
              {u?.bio && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                    Professional Bio
                  </p>
                  <p className="text-sm text-gray-600 italic leading-relaxed bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                    "{u.bio}"
                  </p>
                </div>
              )}

              {/* Expertise */}
              {u?.expertise?.length > 0 && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                    Expertise
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {u.expertise.map((tag, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Social Links */}
              {(u?.socialLinks?.whatsapp || u?.socialLinks?.facebook || u?.socialLinks?.linkedin) && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
                    Social Links
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {u.socialLinks?.whatsapp && (
                      <a
                        href={`https://wa.me/${u.socialLinks.whatsapp.replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-4 py-2 rounded-xl font-medium transition-colors"
                      >
                        <ExternalLink size={13} /> WhatsApp
                      </a>
                    )}
                    {u.socialLinks?.facebook && (
                      <a
                        href={u.socialLinks.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-4 py-2 rounded-xl font-medium transition-colors"
                      >
                        <ExternalLink size={13} /> Facebook
                      </a>
                    )}
                    {u.socialLinks?.linkedin && (
                      <a
                        href={u.socialLinks.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 px-4 py-2 rounded-xl font-medium transition-colors"
                      >
                        <Linkedin size={13} /> LinkedIn
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* ── Section 3: Network & Performance ── */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2 border-t border-gray-100">

                {/* Left: Network */}
                <div className="space-y-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Network</p>

                  <div>
                    <p className="text-xs text-gray-400 mb-1">Referral Code</p>
                    {u?.referralCode ? (
                      <span className="font-mono bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm font-bold">
                        {u.referralCode}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400 italic">Not assigned</span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 bg-amber-50 border border-amber-100 rounded-xl p-4">
                    <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-700 font-bold text-sm flex items-center justify-center flex-shrink-0">
                      {u?.referredBy?.name?.[0]?.toUpperCase() ?? "—"}
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">
                        Mentor / Referred By
                      </p>
                      <p className="font-bold text-gray-800 text-sm">
                        {u?.referredBy?.name ?? "None"}
                      </p>
                      {u?.referredBy?.phone && (
                        <p className="text-xs text-gray-400">{u.referredBy.phone}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Performance */}
                <div className="space-y-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Performance</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-indigo-50 rounded-xl p-4 text-center border border-indigo-100">
                      <p className="text-2xl font-black text-indigo-700">
                        {(approvedCount ?? 0) + (pendingCount ?? 0)}
                      </p>
                      <p className="text-[10px] font-bold uppercase tracking-wide text-indigo-400 mt-1">
                        Assigned Leads
                      </p>
                    </div>
                    <div className="bg-emerald-50 rounded-xl p-4 text-center border border-emerald-100">
                      <p className="text-2xl font-black text-emerald-700">{approvedCount ?? 0}</p>
                      <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-400 mt-1">
                        Converted
                      </p>
                    </div>
                    <div className="bg-amber-50 rounded-xl p-4 text-center border border-amber-100">
                      <p className="text-2xl font-black text-amber-700">{pendingCount ?? 0}</p>
                      <p className="text-[10px] font-bold uppercase tracking-wide text-amber-400 mt-1">
                        Pending
                      </p>
                    </div>
                    <div className="bg-purple-50 rounded-xl p-4 text-center border border-purple-100">
                      <p className="text-2xl font-black text-purple-700">
                        {u?.referralCode ? "Active" : "N/A"}
                      </p>
                      <p className="text-[10px] font-bold uppercase tracking-wide text-purple-400 mt-1">
                        Referral
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerProfileModal;
