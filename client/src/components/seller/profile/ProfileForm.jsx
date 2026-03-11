import React from "react";
import {
  Camera, Mail, Phone, User, Facebook, Linkedin, Code,
  Loader2, Hash,
} from "lucide-react";

const ProfileForm = ({
  profileData,
  formData,
  onChange,
  onImageUpload,
  onSubmit,
  saving,
  uploadingImage,
  fileInputRef,
}) => (
  <form onSubmit={onSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">

    {/* Avatar Section */}
    <div className="flex flex-col sm:flex-row items-center gap-6 pb-8 border-b border-gray-100">
      <div className="relative group">
        <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-50 flex items-center justify-center text-gray-300">
          {formData.profilePhoto ? (
            <img src={formData.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <User size={40} />
          )}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          >
            <Camera className="text-white w-6 h-6 mb-1" />
            <span className="text-[10px] text-white font-medium uppercase tracking-wider">Change</span>
          </div>
          {uploadingImage && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-brand-600" />
            </div>
          )}
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={onImageUpload}
          accept="image/*"
          className="hidden"
        />
      </div>
      <div className="text-center sm:text-left">
        <h3 className="text-lg font-bold text-gray-900">{profileData?.name}</h3>
        <p className="text-sm text-gray-500 mb-2">
          Seller since {new Date(profileData?.memberSince).getFullYear()}
        </p>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadingImage}
          className="text-sm font-medium text-brand-600 hover:text-brand-700 disabled:opacity-50"
        >
          {uploadingImage ? "Uploading..." : "Upload new photo"}
        </button>
      </div>
    </div>

    {/* Inputs Grid */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-8">

      {/* Full Name */}
      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-gray-700">Full Name</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <User className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={onChange}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium text-gray-800"
            required
          />
        </div>
      </div>

      {/* Phone */}
      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-gray-700">Phone Number</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Phone className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={onChange}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium text-gray-800"
            required
          />
        </div>
      </div>

      {/* Email (read-only) */}
      <div className="space-y-1.5 sm:col-span-2">
        <label className="text-sm font-semibold text-gray-700">
          Email Address <span className="text-gray-400 font-normal">(Read-only)</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="email"
            value={profileData?.email || ""}
            disabled
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-100 bg-gray-50 text-gray-500 cursor-not-allowed font-medium"
          />
        </div>
      </div>

      {/* Bio */}
      <div className="space-y-1.5 sm:col-span-2">
        <label className="text-sm font-semibold text-gray-700">Professional Bio</label>
        <textarea
          name="bio"
          value={formData.bio}
          onChange={onChange}
          rows="3"
          placeholder="Helping families find their dream homes…"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium text-gray-800 resize-none"
        />
      </div>

      {/* Expertise */}
      <div className="space-y-1.5 sm:col-span-2">
        <label className="text-sm font-semibold text-gray-700">Areas of Expertise</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Hash className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            name="expertiseString"
            value={formData.expertiseString}
            onChange={onChange}
            placeholder="e.g. Aftabnagar, Duplex, Commercial Space (comma separated)"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium text-gray-800"
          />
        </div>
      </div>

      {/* Social Links */}
      <div className="sm:col-span-2 mt-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 border-b border-gray-100 pb-2">
          Social Contact Links
        </h3>
        <div className="grid grid-cols-1 gap-4">
          {/* WhatsApp */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Code className="h-4 w-4 text-[#25D366]" />
            </div>
            <input
              type="text"
              name="socialLinks.whatsapp"
              value={formData.socialLinks.whatsapp}
              onChange={onChange}
              placeholder="WhatsApp Number (e.g. +88017...)"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all font-medium text-gray-800"
            />
          </div>
          {/* LinkedIn */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Linkedin className="h-4 w-4 text-[#0077b5]" />
            </div>
            <input
              type="url"
              name="socialLinks.linkedin"
              value={formData.socialLinks.linkedin}
              onChange={onChange}
              placeholder="LinkedIn Profile URL"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-gray-800"
            />
          </div>
          {/* Facebook */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Facebook className="h-4 w-4 text-[#1877F2]" />
            </div>
            <input
              type="url"
              name="socialLinks.facebook"
              value={formData.socialLinks.facebook}
              onChange={onChange}
              placeholder="Facebook Profile URL"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-gray-800"
            />
          </div>
        </div>
      </div>
    </div>

    {/* Submit */}
    <div className="pt-8 mt-8 border-t border-gray-100 flex justify-end">
      <button
        type="submit"
        disabled={saving || uploadingImage}
        className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-black focus:ring-4 focus:ring-gray-900/20 transition-all disabled:opacity-70 flex items-center gap-2"
      >
        {saving ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Publishing...
          </>
        ) : (
          "Update Digital Card"
        )}
      </button>
    </div>
  </form>
);

export default ProfileForm;
