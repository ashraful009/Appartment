import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { User, Mail, Lock, Eye, EyeOff, AlertCircle, Camera } from "lucide-react";

const Register = () => {
  const { register }  = useAuth();
  const navigate      = useNavigate();

  const [form, setForm]               = useState({ name: "", email: "", password: "" });
  const [avatarFile, setAvatarFile]   = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [errors, setErrors]           = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading]         = useState(false);
  const [showPass, setShowPass]       = useState(false);
  const fileInputRef                  = useRef(null);

  // ── Validation ──────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Full name is required.";
    if (!form.email.trim()) {
      e.email = "Email is required.";
    } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      e.email = "Please enter a valid email address.";
    }
    if (!form.password) {
      e.password = "Password is required.";
    } else if (form.password.length < 6) {
      e.password = "Password must be at least 6 characters.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
    if (serverError) setServerError("");
  };

  // ── Avatar file picker ──────────────────────────────────────────────────
  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side size check (2 MB)
    if (file.size > 2 * 1024 * 1024) {
      setServerError("Profile picture must be under 2 MB.");
      return;
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    if (serverError) setServerError("");
  };

  const removeAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ── Submit ──────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
      // Build FormData so we can include the optional avatar file
      const formData = new FormData();
      formData.append("name",     form.name);
      formData.append("email",    form.email);
      formData.append("password", form.password);
      if (avatarFile) formData.append("avatar", avatarFile);

      await register(formData); // updates AuthContext state, sets cookie
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

            {/* ── Server error ── */}
            {serverError && (
              <div className="mb-5 flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                <AlertCircle size={17} className="mt-0.5 flex-shrink-0" />
                <span>{serverError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-5">

              {/* ── Avatar picker ── */}
              <div className="flex flex-col items-center gap-3">
                <div className="relative">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Profile preview"
                      className="w-24 h-24 rounded-full object-cover border-4 border-brand-200 shadow"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gray-100 border-4 border-brand-200 flex items-center justify-center shadow">
                      <User size={36} className="text-gray-400" />
                    </div>
                  )}
                  {/* Camera overlay button */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 w-8 h-8 bg-brand-600 hover:bg-brand-700 text-white rounded-full flex items-center justify-center shadow-md transition-colors"
                    title="Upload profile picture"
                  >
                    <Camera size={14} />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs text-brand-600 font-medium hover:text-brand-800 transition-colors"
                  >
                    {avatarFile ? "Change picture" : "Upload profile picture"}
                  </button>
                  {avatarFile && (
                    <>
                      <span className="text-gray-300 text-xs">·</span>
                      <button
                        type="button"
                        onClick={removeAvatar}
                        className="text-xs text-red-400 hover:text-red-600 transition-colors"
                      >
                        Remove
                      </button>
                    </>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
                <p className="text-xs text-gray-400">Optional · Max 2 MB · JPG, PNG, WebP</p>
              </div>

              {/* ── Name ── */}
              <div>
                <label className="form-label" htmlFor="name">Full Name</label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    id="name" type="text" name="name" value={form.name}
                    onChange={handleChange} placeholder="John Doe"
                    className={`input-field pl-10 ${errors.name ? "border-red-400 focus:ring-red-300" : ""}`}
                  />
                </div>
                {errors.name && (
                  <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle size={12} />{errors.name}
                  </p>
                )}
              </div>

              {/* ── Email ── */}
              <div>
                <label className="form-label" htmlFor="email">Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    id="email" type="email" name="email" value={form.email}
                    onChange={handleChange} placeholder="you@example.com"
                    className={`input-field pl-10 ${errors.email ? "border-red-400 focus:ring-red-300" : ""}`}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle size={12} />{errors.email}
                  </p>
                )}
              </div>

              {/* ── Password ── */}
              <div>
                <label className="form-label" htmlFor="password">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    id="password" type={showPass ? "text" : "password"} name="password"
                    value={form.password} onChange={handleChange} placeholder="Min. 6 characters"
                    className={`input-field pl-10 pr-10 ${errors.password ? "border-red-400 focus:ring-red-300" : ""}`}
                  />
                  <button
                    type="button" onClick={() => setShowPass((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle size={12} />{errors.password}
                  </p>
                )}
              </div>

              {/* ── Submit ── */}
              <button
                type="submit" disabled={loading}
                className="w-full btn-primary py-3.5 text-base flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
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
