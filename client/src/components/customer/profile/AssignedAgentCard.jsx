import React from "react";
import { Phone, Mail, MessageCircle, ShieldCheck, User } from "lucide-react";

/**
 * AssignedAgentCard — premium digital visiting card for the assigned seller.
 * Props: agent {object | null}
 */
const AssignedAgentCard = ({ agent }) => {
  // ── Empty state ──────────────────────────────────────────────────────────
  if (!agent) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-10 px-6 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50">
        <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <User size={24} className="text-gray-300" />
        </div>
        <p className="text-sm font-semibold text-gray-500">No Agent Assigned Yet</p>
        <p className="text-xs text-gray-400 mt-1 max-w-[220px] leading-relaxed">
          Our team will assign a dedicated agent to your account shortly.
        </p>
      </div>
    );
  }

  // ── Populated agent card ─────────────────────────────────────────────────
  const { name, profilePhoto, email, phone, bio, expertise = [], socialLinks } = agent;
  const whatsapp = socialLinks?.whatsapp;

  return (
    <div className="relative rounded-2xl overflow-hidden border border-brand-100 shadow-md bg-white">

      {/* ── Gradient header strip ─────────────────────────────────────── */}
      <div className="h-20 bg-gradient-to-r from-brand-600 to-brand-400" />

      {/* ── Avatar ───────────────────────────────────────────────────── */}
      <div className="px-6">
        <div className="-mt-10 mb-3">
          {profilePhoto ? (
            <img
              src={profilePhoto}
              alt={name}
              className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
            />
          ) : (
            <div className="w-20 h-20 rounded-full border-4 border-white shadow-lg bg-brand-100 flex items-center justify-center">
              <User size={32} className="text-brand-500" />
            </div>
          )}
        </div>

        {/* ── Name + badge ─────────────────────────────────────────────── */}
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <h3 className="text-lg font-extrabold text-gray-900">{name}</h3>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full">
            <ShieldCheck size={11} />
            Verified Agent
          </span>
        </div>

        {/* ── Bio ──────────────────────────────────────────────────────── */}
        {bio && (
          <p className="text-sm text-gray-500 italic leading-relaxed mb-4">
            "{bio}"
          </p>
        )}

        {/* ── Expertise pills ──────────────────────────────────────────── */}
        {expertise.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-5">
            {expertise.map((tag) => (
              <span
                key={tag}
                className="text-[11px] font-semibold bg-brand-50 text-brand-700 border border-brand-100 px-2.5 py-0.5 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* ── Quick-action buttons ─────────────────────────────────────── */}
        <div className="flex flex-wrap gap-2 pb-6">
          {phone && (
            <a
              href={`tel:${phone}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold transition-colors shadow-sm"
            >
              <Phone size={13} />
              Call
            </a>
          )}

          {email && (
            <a
              href={`mailto:${email}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold transition-colors"
            >
              <Mail size={13} />
              Email
            </a>
          )}

          {whatsapp && (
            <a
              href={`https://wa.me/${whatsapp.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold transition-colors shadow-sm"
            >
              <MessageCircle size={13} />
              WhatsApp
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssignedAgentCard;
