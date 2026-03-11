import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import {
  User,
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Gift,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

// ── Reusable field wrapper ────────────────────────────────────────────────────
const Field = ({ label, required, error, children }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
      {label}
      {required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
    {children}
    {error && (
      <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
        <AlertCircle size={11} className="flex-shrink-0" />
        {error}
      </p>
    )}
  </div>
);

// ── Icon-left text input ──────────────────────────────────────────────────────
const IconInput = ({ icon: Icon, error, ...props }) => (
  <div className="relative">
    <Icon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
    <input
      {...props}
      className={`input-field pl-10 ${error ? "border-red-400 focus:ring-red-300" : ""}`}
    />
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────
const Register = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    referralCode: "",
  });

  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  // ── Field change handler ────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
    if (serverError) setServerError("");
  };

  // ── Validation ──────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};

    if (!form.name.trim())
      e.name = "Full name is required.";

    if (!form.phone.trim()) {
      e.phone = "Phone number is required.";
    } else if (!/^[0-9+\-\s()]{7,15}$/.test(form.phone.trim())) {
      e.phone = "Enter a valid phone number.";
    }

    if (!form.email.trim()) {
      e.email = "Email is required.";
    } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      e.email = "Enter a valid email address.";
    }

    if (!form.password) {
      e.password = "Password is required.";
    } else if (form.password.length < 6) {
      e.password = "Password must be at least 6 characters.";
    }

    if (!form.confirmPassword) {
      e.confirmPassword = "Please confirm your password.";
    } else if (form.password !== form.confirmPassword) {
      e.confirmPassword = "Passwords do not match.";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
      // Send JSON — no avatar/file upload in the new flow
      await axios.post("/api/auth/register", {
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        password: form.password,
        referralCode: form.referralCode.trim() || undefined,
      });

      // Auto-login after registration
      await login({ email: form.email.trim(), password: form.password });
      navigate("/");
    } catch (err) {
      setServerError(
        err?.response?.data?.message || "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-120px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">

          {/* ── Header ── */}
          <div className="bg-gradient-to-br from-brand-700 to-brand-900 px-8 py-8 text-center">
            <div className="text-4xl mb-2">🏠</div>
            <h1 className="text-2xl font-extrabold text-white">Create Account</h1>
            <p className="text-brand-200 text-sm mt-1">Join our real estate platform</p>
          </div>

          <div className="px-8 py-8">

            {/* ── Server error banner ── */}
            {serverError && (
              <div className="mb-5 flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                <AlertCircle size={17} className="mt-0.5 flex-shrink-0" />
                <span>{serverError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-4">

              {/* ── Full Name ── */}
              <Field label="Full Name" required error={errors.name}>
                <IconInput
                  icon={User}
                  id="name" name="name" type="text"
                  value={form.name} onChange={handleChange}
                  placeholder="John Doe"
                  error={errors.name}
                />
              </Field>

              {/* ── Phone Number ── */}
              <Field label="Phone Number" required error={errors.phone}>
                <IconInput
                  icon={Phone}
                  id="phone" name="phone" type="tel"
                  value={form.phone} onChange={handleChange}
                  placeholder="+880 1700-000000"
                  error={errors.phone}
                />
              </Field>

              {/* ── Email ── */}
              <Field label="Email Address" required error={errors.email}>
                <IconInput
                  icon={Mail}
                  id="email" name="email" type="email"
                  value={form.email} onChange={handleChange}
                  placeholder="you@example.com"
                  error={errors.email}
                />
              </Field>

              {/* ── Password ── */}
              <Field label="Password" required error={errors.password}>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    id="password" name="password"
                    type={showPass ? "text" : "password"}
                    value={form.password} onChange={handleChange}
                    placeholder="Min. 6 characters"
                    className={`input-field pl-10 pr-10 ${errors.password ? "border-red-400 focus:ring-red-300" : ""}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </Field>

              {/* ── Confirm Password ── */}
              <Field label="Confirm Password" required error={errors.confirmPassword}>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    id="confirmPassword" name="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    value={form.confirmPassword} onChange={handleChange}
                    placeholder="Re-enter your password"
                    className={`input-field pl-10 pr-10 ${errors.confirmPassword ? "border-red-400 focus:ring-red-300" : ""}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {/* Inline match indicator */}
                {form.confirmPassword && !errors.confirmPassword && form.password === form.confirmPassword && (
                  <p className="mt-1.5 text-xs text-emerald-600 flex items-center gap-1">
                    <CheckCircle size={11} /> Passwords match
                  </p>
                )}
              </Field>

              {/* ── Referral Code (optional) ── */}
              <Field label="Referral Code" error={errors.referralCode}>
                <div className="relative">
                  <Gift size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    id="referralCode" name="referralCode" type="text"
                    value={form.referralCode} onChange={handleChange}
                    placeholder="Optional — leave blank if none"
                    className="input-field pl-10 text-gray-500"
                  />
                </div>
              </Field>

              {/* ── Submit ── */}
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3.5 text-base flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              >
                {loading ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating account…
                  </>
                ) : "Create Account"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500">
              Already have an account?{" "}
              <Link to="/login" className="text-brand-600 font-semibold hover:text-brand-800 transition-colors">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
