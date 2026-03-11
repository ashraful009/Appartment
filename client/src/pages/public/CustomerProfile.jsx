import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Camera, Mail, Phone, MapPin, Briefcase, Clock, Loader2, User, Facebook, Linkedin, Code } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const CustomerProfile = () => {
  useAuth(); // ensures page is rendered in an authenticated context
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    profilePhoto: "",
    address: { present: "", permanent: "" },
    occupation: "",
    preferredContactTime: "Anytime",
  });

  const fileInputRef = useRef(null);

  // Constants for Cloudinary (Ideally these are from environment variables in a real app, 
  // but for pure frontend upload using unsigned presets, name and preset are public)
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
        address: {
          present: user.address?.present || "",
          permanent: user.address?.permanent || "",
        },
        occupation: user.occupation || "",
        preferredContactTime: user.preferredContactTime || "Anytime",
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

  // Image Upload Logic
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate size (e.g., max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setUploadingImage(true);
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    try {
      const res = await fetch(CLOUDINARY_URL, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      
      if (data.secure_url) {
        setFormData((prev) => ({ ...prev, profilePhoto: data.secure_url }));
        toast.success("Photo uploaded! Click 'Save Changes' to update your profile.");
      } else {
        throw new Error("Failed to upload image");
      }
    } catch (error) {
      toast.error("Error uploading image");
      console.error(error);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await axios.put("/api/users/profile", formData, {
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

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
      </div>
    );
  }

  // Derived properties for UI
  const assignedSeller = profileData?.currentAssignedSeller;
  const wishlist = profileData?.wishlist || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">My Profile</h1>
        <p className="text-gray-500 mt-2">Manage your personal information and contact preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Form */}
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
                  
                  {/* Overlay for hover */}
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <Camera className="text-white w-6 h-6 mb-1" />
                    <span className="text-[10px] text-white font-medium uppercase tracking-wider">Change</span>
                  </div>
                  
                  {/* Uploading Spinner */}
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
                <p className="text-sm text-gray-500 mb-2">Member since {new Date(profileData?.memberSince).getFullYear()}</p>
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
                <label className="text-sm font-semibold text-gray-700">Email Address <span className="text-gray-400 font-normal">(Cannot be changed)</span></label>
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

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Occupation</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Briefcase className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="occupation"
                    value={formData.occupation}
                    onChange={handleInputChange}
                    placeholder="e.g. Software Engineer"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium text-gray-800"
                  />
                </div>
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-sm font-semibold text-gray-700">Present Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="address.present"
                    value={formData.address.present}
                    onChange={handleInputChange}
                    placeholder="Current residential address"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium text-gray-800"
                  />
                </div>
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-sm font-semibold text-gray-700">Permanent Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="address.permanent"
                    value={formData.address.permanent}
                    onChange={handleInputChange}
                    placeholder="Permanent residential address"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium text-gray-800"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Preferred Contact Time</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Clock className="h-4 w-4 text-gray-400" />
                  </div>
                  <select
                    name="preferredContactTime"
                    value={formData.preferredContactTime}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium text-gray-800 appearance-none bg-white"
                  >
                    <option value="Morning">Morning</option>
                    <option value="Afternoon">Afternoon</option>
                    <option value="Evening">Evening</option>
                    <option value="Anytime">Anytime</option>
                  </select>
                </div>
              </div>

            </div>

            <div className="pt-8 mt-8 border-t border-gray-100 flex justify-end">
              <button
                type="submit"
                disabled={saving || uploadingImage}
                className="bg-brand-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-brand-700 focus:ring-4 focus:ring-brand-500/20 transition-all disabled:opacity-70 flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </form>

        </div>

        {/* Right Column: Widgets */}
        <div className="space-y-6">
          
          {/* Assigned Agent Widget */}
          {assignedSeller && (
            <div className="bg-gradient-to-br from-indigo-900 to-brand-900 rounded-2xl shadow-lg border border-indigo-800 overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <User size={100} />
              </div>
              <div className="p-6 relative z-10">
                <h3 className="text-[10px] font-bold tracking-widest uppercase text-indigo-300 mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  My Assigned Agent
                </h3>
                
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full border-2 border-indigo-400/30 overflow-hidden bg-indigo-800 flex-shrink-0">
                    {assignedSeller.profilePhoto ? (
                      <img src={assignedSeller.profilePhoto} alt="Agent" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-indigo-300">
                        <User size={24} />
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 
                      onClick={() => setIsModalOpen(true)}
                      className="text-lg font-bold text-white cursor-pointer hover:text-indigo-200 hover:underline transition-colors"
                    >
                      {assignedSeller.name}
                    </h4>
                    <p className="text-sm text-indigo-200/80 line-clamp-1">{assignedSeller.bio || "Real Estate Expert"}</p>
                  </div>
                </div>

                <div className="mt-5 pt-5 border-t border-indigo-800/50 flex gap-2">
                  <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2 rounded-lg text-sm font-semibold transition-colors border border-white/5"
                  >
                    View Biodata
                  </button>
                  <a 
                    href={`tel:${assignedSeller.phone}`}
                    className="w-10 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors border border-white/5"
                  >
                    <Phone size={16} />
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Wishlist Widget */}
          {wishlist.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 line-clamp-1">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-4">
                My Wishlist <span className="bg-brand-100 text-brand-700 py-0.5 px-2 rounded-full text-xs">{wishlist.length}</span>
              </h3>
              
              <div className="space-y-3">
                {wishlist.slice(0, 3).map((property) => (
                  <a 
                    key={property._id}
                    href={`/property/${property._id}`}
                    className="flex gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100 group"
                  >
                    <div className="w-16 h-16 rounded-lg bg-gray-200 overflow-hidden flex-shrink-0">
                      <img 
                        src={property.images?.[0] || "/placeholder.jpg"} 
                        alt={property.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 line-clamp-1">{property.title}</h4>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-1">{property.location?.address}</p>
                      <p className="text-xs font-bold text-brand-600 mt-1.5 flex items-center gap-1">
                        ৳{property.price?.toLocaleString()}
                        {property.status === "rent" && <span className="text-[10px] text-gray-400 font-normal">/mo</span>}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
              
              {wishlist.length > 3 && (
                <button className="w-full mt-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                  View full wishlist
                </button>
              )}
            </div>
          )}

        </div>
      </div>

      {/* ── Seller Biodata Modal ── */}
      {isModalOpen && assignedSeller && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          
          {/* Click outside to close */}
          <div className="absolute inset-0" onClick={() => setIsModalOpen(false)} />
          
          <div className="bg-white rounded-3xl w-full max-w-md relative z-10 shadow-2xl overflow-hidden transform transition-all">
            
            {/* Header / Cover Space */}
            <div className="h-32 bg-gradient-to-r from-brand-600 to-indigo-600 relative">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-white/70 hover:text-white bg-black/20 hover:bg-black/40 rounded-full w-8 h-8 flex items-center justify-center transition-all"
              >
                ✕
              </button>
            </div>

            {/* Avatar & Content */}
            <div className="px-8 pb-8">
              
              {/* Avatar lifted out of the header */}
              <div className="flex justify-center -mt-16 mb-4">
                <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-100 flex flex-col items-center justify-center">
                  {assignedSeller.profilePhoto ? (
                    <img src={assignedSeller.profilePhoto} alt={assignedSeller.name} className="w-full h-full object-cover" />
                  ) : (
                    <User size={48} className="text-gray-300" />
                  )}
                </div>
              </div>

              {/* Name & Titles */}
              <div className="text-center mb-6">
                <h2 className="text-2xl font-black text-gray-900 border-b-2 border-transparent inline-flex pb-1">{assignedSeller.name}</h2>
                <p className="text-sm font-medium text-brand-600 tracking-wide uppercase mt-1">Real Estate Agent</p>
              </div>

              {/* Bio block */}
              {assignedSeller.bio && (
                <div className="bg-gray-50 rounded-2xl p-4 mb-6 relative">
                  <div className="absolute top-2 left-2 text-gray-300 text-3xl font-serif">"</div>
                  <p className="text-sm text-gray-600 italic text-center leading-relaxed relative z-10 px-4">
                    {assignedSeller.bio}
                  </p>
                </div>
              )}

              {/* Expertise Pills */}
              {assignedSeller.expertise && assignedSeller.expertise.length > 0 && (
                <div className="mb-8">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 text-center">Areas of Expertise</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {assignedSeller.expertise.map((exp, i) => (
                      <span key={i} className="bg-brand-50 text-brand-700 text-xs font-semibold px-3 py-1 rounded-full border border-brand-100/50">
                        {exp}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact Icons */}
              <div className="flex items-center justify-center gap-4 mt-6">
                <a 
                  href={`tel:${assignedSeller.phone}`}
                  title={assignedSeller.phone}
                  className="w-12 h-12 rounded-full bg-gray-100 hover:bg-brand-50 hover:text-brand-600 text-gray-600 flex items-center justify-center transition-colors shadow-sm"
                >
                  <Phone size={20} />
                </a>
                <a 
                  href={`mailto:${assignedSeller.email}`}
                  title={assignedSeller.email}
                  className="w-12 h-12 rounded-full bg-gray-100 hover:bg-brand-50 hover:text-brand-600 text-gray-600 flex items-center justify-center transition-colors shadow-sm"
                >
                  <Mail size={20} />
                </a>

                {/* Social Links */}
                {assignedSeller.socialLinks?.whatsapp && (
                  <a 
                    href={`https://wa.me/${assignedSeller.socialLinks.whatsapp.replace(/[^0-9]/g, '')}`} 
                    target="_blank" rel="noreferrer"
                    className="w-12 h-12 rounded-full bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white flex items-center justify-center transition-all shadow-sm"
                  >
                    <Code size={20} className="hidden" /> {/* Using Code as placeholder if whatsapp icon missing, though Phone works too */}
                    <span className="font-bold font-serif text-lg leading-none">W</span>
                  </a>
                )}
                
                {assignedSeller.socialLinks?.linkedin && (
                  <a 
                    href={assignedSeller.socialLinks.linkedin} 
                    target="_blank" rel="noreferrer"
                    className="w-12 h-12 rounded-full bg-[#0077b5]/10 text-[#0077b5] hover:bg-[#0077b5] hover:text-white flex items-center justify-center transition-all shadow-sm"
                  >
                    <Linkedin size={20} />
                  </a>
                )}
                
                {assignedSeller.socialLinks?.facebook && (
                  <a 
                    href={assignedSeller.socialLinks.facebook} 
                    target="_blank" rel="noreferrer"
                    className="w-12 h-12 rounded-full bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2] hover:text-white flex items-center justify-center transition-all shadow-sm"
                  >
                    <Facebook size={20} />
                  </a>
                )}
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CustomerProfile;
