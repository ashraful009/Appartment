import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import ProfileForm from "../../components/seller/profile/ProfileForm";
import ReferralCodeWidget from "../../components/seller/profile/ReferralCodeWidget";
import PerformanceStats from "../../components/seller/profile/PerformanceStats";
import MentorCard from "../../components/seller/profile/MentorCard";

const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dzi9yfdw9/image/upload";
const CLOUDINARY_UPLOAD_PRESET = "ml_default";

// ── Main ──────────────────────────────────────────────────────────────────────
const SellerProfile = () => {
  useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    profilePhoto: "",
    bio: "",
    socialLinks: { linkedin: "", facebook: "", whatsapp: "" },
    expertiseString: "",
  });

  useEffect(() => { fetchProfile(); }, []);

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
    } catch {
      toast.error("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData(prev => ({ ...prev, [parent]: { ...prev[parent], [child]: value } }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be less than 5MB"); return; }
    setUploadingImage(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    try {
      const res = await fetch(CLOUDINARY_URL, { method: "POST", body: fd });
      const data = await res.json();
      if (data.secure_url) {
        setFormData(prev => ({ ...prev, profilePhoto: data.secure_url }));
        toast.success("Photo uploaded! Click 'Save Changes' to update your profile.");
      } else throw new Error();
    } catch {
      toast.error("Error uploading image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const expertiseArray = formData.expertiseString.split(",").map(i => i.trim()).filter(Boolean);
    const payload = { ...formData, expertise: expertiseArray };
    delete payload.expertiseString;
    try {
      const { data } = await axios.put("/api/users/profile", payload, { withCredentials: true });
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

  const stats = profileData?.stats || { totalAssignedLeads: 0, totalConvertedCustomers: 0 };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Digital Visiting Card</h1>
        <p className="text-gray-500 mt-2">Manage your public seller profile, custom links, and track your metrics.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column — form */}
        <div className="lg:col-span-2">
          <ProfileForm
            profileData={profileData}
            formData={formData}
            onChange={handleInputChange}
            onImageUpload={handleImageUpload}
            onSubmit={handleSubmit}
            saving={saving}
            uploadingImage={uploadingImage}
            fileInputRef={fileInputRef}
          />
        </div>

        {/* Right column — widgets */}
        <div className="space-y-6">
          <ReferralCodeWidget referralCode={profileData?.referralCode} />
          <PerformanceStats stats={stats} />
          <MentorCard mentor={profileData?.referredBy} />
        </div>
      </div>
    </div>
  );
};

export default SellerProfile;
