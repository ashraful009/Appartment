import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { 
  Camera, Mail, Phone, User, Facebook, Linkedin, Code, 
  Loader2, CheckCheck, Copy, Hash, Target, Users
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const SellerProfile = () => {
  useAuth(); // ensures page is rendered in an authenticated context
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    profilePhoto: "",
    bio: "",
    socialLinks: { linkedin: "", facebook: "", whatsapp: "" },
    expertiseString: "", // comma-separated for UI
  });

  const fileInputRef = useRef(null);
  const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dzi9yfdw9/image/upload";
  const CLOUDINARY_UPLOAD_PRESET = "ml_default"; 

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await axios.get("/api/users/profile", { withCredentials: true });
      const user = data.user;
      setProfileData(user);
      
      setFormData({
        name: user.name || "",
        phone: user.phone || "",
        profilePhoto: user.profilePhoto || "",
        bio: user.bio || "",
        socialLinks: {
          linkedin: user.socialLinks?.linkedin || "",
          facebook: user.socialLinks?.facebook || "",
          whatsapp: user.socialLinks?.whatsapp || "",
        },
        expertiseString: user.expertise ? user.expertise.join(", ") : "",
      });
    } catch (err) {
      toast.error("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setUploadingImage(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    try {
      const res = await fetch(CLOUDINARY_URL, { method: "POST", body: fd });
      const data = await res.json();
      
      if (data.secure_url) {
        setFormData((prev) => ({ ...prev, profilePhoto: data.secure_url }));
        toast.success("Photo uploaded! Click 'Save Changes' to update your profile.");
      } else {
        throw new Error("Failed to upload image");
      }
    } catch (error) {
      toast.error("Error uploading image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    // Process comma-separated expertise into an array
    const expertiseArray = formData.expertiseString
      .split(",")
      .map(item => item.trim())
      .filter(item => item !== "");

    // Prepare payload
    const payload = {
      ...formData,
      expertise: expertiseArray
    };
    
    // Remove the temporary string field from the real payload
    delete payload.expertiseString;

    try {
      const { data } = await axios.put("/api/users/profile", payload, {
        withCredentials: true,
      });
      toast.success(data.message || "Profile updated successfully!");
      setProfileData(data.user);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCopyCode = async () => {
    const code = profileData?.referralCode;
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      const el = document.createElement("textarea");
      el.value = code;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
      </div>
    );
  }

  const stats = profileData?.stats || { totalAssignedLeads: 0, totalConvertedCustomers: 0 };
  const mentor = profileData?.referredBy;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Digital Visiting Card</h1>
        <p className="text-gray-500 mt-2">Manage your public seller profile, custom links, and track your metrics.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ── Left Column: Form Builder ── */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
            
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
                  onChange={handleImageUpload} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>
              
              <div className="text-center sm:text-left">
                <h3 className="text-lg font-bold text-gray-900">{profileData?.name}</h3>
                <p className="text-sm text-gray-500 mb-2">Seller since {new Date(profileData?.memberSince).getFullYear()}</p>
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
              
              {/* Basic Info */}
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
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium text-gray-800"
                    required
                  />
                </div>
              </div>

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
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium text-gray-800"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-sm font-semibold text-gray-700">Email Address <span className="text-gray-400 font-normal">(Read-only)</span></label>
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

              {/* Advanced Seller Info */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-sm font-semibold text-gray-700">Professional Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Helping families find their dream homes specializing in duplexes & commercial plots..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium text-gray-800 resize-none"
                />
              </div>

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
                    onChange={handleInputChange}
                    placeholder="e.g. Aftabnagar, Duplex, Commercial Space (comma separated)"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium text-gray-800"
                  />
                </div>
              </div>

              {/* Social Links */}
              <div className="sm:col-span-2 mt-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 border-b border-gray-100 pb-2">Social Contact Links</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Code className="h-4 w-4 text-[#25D366]" /> {/* using Code icon to symbolize WA if logo unsupported */}
                      <span className="font-bold font-serif text-[#25D366] absolute left-3 w-4text-center">W</span>
                    </div>
                    <input
                      type="text"
                      name="socialLinks.whatsapp"
                      value={formData.socialLinks.whatsapp}
                      onChange={handleInputChange}
                      placeholder="WhatsApp Number (e.g. +88017...)"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all font-medium text-gray-800"
                    />
                  </div>
                  
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Linkedin className="h-4 w-4 text-[#0077b5]" />
                    </div>
                    <input
                      type="url"
                      name="socialLinks.linkedin"
                      value={formData.socialLinks.linkedin}
                      onChange={handleInputChange}
                      placeholder="LinkedIn Profile URL"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-gray-800"
                    />
                  </div>

                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Facebook className="h-4 w-4 text-[#1877F2]" />
                    </div>
                    <input
                      type="url"
                      name="socialLinks.facebook"
                      value={formData.socialLinks.facebook}
                      onChange={handleInputChange}
                      placeholder="Facebook Profile URL"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-gray-800"
                    />
                  </div>
                </div>
              </div>

            </div>

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

        </div>

        {/* ── Right Column: Stats & Setup ── */}
        <div className="space-y-6">
          
          {/* Referral Code Widget */}
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
                    {profileData?.referralCode || "----"}
                  </span>
                </div>
                <button 
                  onClick={handleCopyCode}
                  title="Copy to clipboard"
                  className="w-16 h-[74px] flex flex-col items-center justify-center gap-1 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-xl transition-colors border border-gray-700"
                >
                  {copiedCode ? <CheckCheck size={20} className="text-emerald-400" /> : <Copy size={20} />}
                  <span className="text-[10px] font-bold uppercase">{copiedCode ? "Copied" : "Copy"}</span>
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-4 text-center">
                Share this uniquely generated code with your network so they can enlist you as their agent when they register.
              </p>
            </div>
          </div>

          {/* Performance Summary Container */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-50 bg-gray-50/50">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest flex items-center gap-2">
                <Users size={14} className="text-brand-600" />
                Performance Summary
              </h3>
            </div>
            
            <div className="p-6 grid grid-cols-2 gap-4">
              {/* Stat Card 1 */}
              <div className="bg-brand-50 rounded-xl p-4 border border-brand-100/50 text-center">
                <p className="text-3xl font-black text-brand-700">{stats.totalAssignedLeads}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-brand-600/70 mt-1">Total Leads</p>
              </div>
              
              {/* Stat Card 2 */}
              <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100/50 text-center">
                <p className="text-3xl font-black text-emerald-600">{stats.totalConvertedCustomers}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600/70 mt-1">Converted</p>
              </div>
            </div>
          </div>

          {/* Mentor Information */}
          {mentor && (
             <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center gap-4">
               <div className="w-12 h-12 rounded-full border-2 border-gray-100 overflow-hidden bg-gray-50 flex-shrink-0">
                 {mentor.profilePhoto ? (
                   <img src={mentor.profilePhoto} alt={mentor.name} className="w-full h-full object-cover" />
                 ) : (
                   <div className="flex items-center justify-center h-full text-gray-300">
                     <User size={20} />
                   </div>
                 )}
               </div>
               <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">My Mentor</p>
                  <p className="text-sm font-bold text-gray-900">{mentor.name}</p>
               </div>
             </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default SellerProfile;
