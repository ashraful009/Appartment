import React, { useState, useEffect } from "react";
import { Save, Loader2, Mail, Lock } from "lucide-react";

const CONTACT_TIMES = ["Morning", "Afternoon", "Evening", "Anytime"];

/**
 * CustomerProfileForm — editable profile form for customer fields.
 * Props:
 *   userData  {object}   — the user document from GET /api/users/profile
 *   onUpdate  {function} — async (formData) => void, called on save
 */
const CustomerProfileForm = ({ userData, onUpdate }) => {
  const [form, setForm] = useState({
    name:                 "",
    phone:                "",
    address_present:      "",
    address_permanent:    "",
    occupation:           "",
    preferredContactTime: "Anytime",
  });
  const [submitting, setSubmitting] = useState(false);

  // Hydrate form when userData arrives / changes
  useEffect(() => {
    if (!userData) return;
    setForm({
      name:                 userData.name                 ?? "",
      phone:                userData.phone                ?? "",
      address_present:      userData.address?.present     ?? "",
      address_permanent:    userData.address?.permanent   ?? "",
      occupation:           userData.occupation            ?? "",
      preferredContactTime: userData.preferredContactTime ?? "Anytime",
    });
  }, [userData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onUpdate({
        name:  form.name,
        phone: form.phone,
        address: {
          present:   form.address_present,
          permanent: form.address_permanent,
        },
        occupation:           form.occupation,
        preferredContactTime: form.preferredContactTime,
      });
    } finally {
      setSubmitting(false);
    }
  };

  // ── Field helpers ──────────────────────────────────────────────────────────
  const inputClass =
    "w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 " +
    "placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent " +
    "transition-shadow";

  const readOnlyClass =
    "w-full px-3.5 py-2.5 rounded-xl border border-gray-100 bg-gray-50 text-sm text-gray-400 cursor-not-allowed";

  const labelClass = "block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* ── Section: Account Info ─────────────────────────────────────── */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 border-b border-gray-100 pb-2">
          Account Info
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Full Name */}
          <div>
            <label className={labelClass}>Full Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Your full name"
              className={inputClass}
              required
            />
          </div>

          {/* Phone */}
          <div>
            <label className={labelClass}>Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="+880 1XXX-XXXXXX"
              className={inputClass}
            />
          </div>

          {/* Email — read-only */}
          <div className="sm:col-span-2">
            <label className={labelClass}>
              <span className="inline-flex items-center gap-1.5">
                <Mail size={11} />
                Email Address
                <span className="inline-flex items-center gap-1 text-gray-300 normal-case font-normal tracking-normal">
                  <Lock size={9} /> Read-only
                </span>
              </span>
            </label>
            <input
              type="email"
              value={userData?.email ?? ""}
              readOnly
              tabIndex={-1}
              className={readOnlyClass}
            />
          </div>
        </div>
      </div>

      {/* ── Section: Personal Details ─────────────────────────────────── */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 border-b border-gray-100 pb-2">
          Personal Details
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Occupation */}
          <div>
            <label className={labelClass}>Occupation</label>
            <input
              type="text"
              name="occupation"
              value={form.occupation}
              onChange={handleChange}
              placeholder="e.g. Software Engineer"
              className={inputClass}
            />
          </div>

          {/* Preferred Contact Time */}
          <div>
            <label className={labelClass}>Preferred Contact Time</label>
            <select
              name="preferredContactTime"
              value={form.preferredContactTime}
              onChange={handleChange}
              className={inputClass}
            >
              {CONTACT_TIMES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── Section: Addresses ────────────────────────────────────────── */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 border-b border-gray-100 pb-2">
          Addresses
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Present Address</label>
            <textarea
              name="address_present"
              value={form.address_present}
              onChange={handleChange}
              rows={3}
              placeholder="Your current address"
              className={`${inputClass} resize-none`}
            />
          </div>
          <div>
            <label className={labelClass}>Permanent Address</label>
            <textarea
              name="address_permanent"
              value={form.address_permanent}
              onChange={handleChange}
              rows={3}
              placeholder="Your permanent / home address"
              className={`${inputClass} resize-none`}
            />
          </div>
        </div>
      </div>

      {/* ── Submit ────────────────────────────────────────────────────── */}
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold shadow-sm transition-all duration-200"
        >
          {submitting ? (
            <><Loader2 size={15} className="animate-spin" /> Saving…</>
          ) : (
            <><Save size={15} /> Save Changes</>
          )}
        </button>
      </div>
    </form>
  );
};

export default CustomerProfileForm;
