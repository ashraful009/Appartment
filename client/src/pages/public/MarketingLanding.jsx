import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Phone, CheckCircle, AlertCircle, User, Loader2 } from "lucide-react";

const MarketingLanding = () => {
  const { slug } = useParams();
  const [property, setProperty] = useState(null);
  const [sellerName, setSellerName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState({ name: "", phone: "" });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchLinkDetails = async () => {
      try {
        const { data } = await axios.get(`/api/marketing/link/${slug}`);
        setProperty(data.property);
        setSellerName(data.sellerName);
      } catch (err) {
        setError(err.response?.data?.message || "Invalid or expired link.");
      } finally {
        setLoading(false);
      }
    };
    fetchLinkDetails();
  }, [slug]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone) return;
    setSubmitLoading(true);
    try {
      await axios.post(`/api/marketing/link/${slug}`, form);
      setSuccess(true);
    } catch (err) {
      alert("Failed to submit request. Please try again.");
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 size={40} className="text-brand-600 animate-spin" />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center px-4">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-gray-800">Oops!</h1>
        <p className="text-gray-600 mt-2">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="md:flex">
            {/* Property Image Section */}
            <div className="md:w-1/2 bg-gray-200">
              {property.image_url ? (
                <img 
                  src={property.image_url} 
                  alt={property.name}
                  className="w-full h-full object-cover min-h-[300px]"
                />
              ) : (
                <div className="w-full h-full min-h-[300px] flex items-center justify-center text-gray-400">
                  No Image Available
                </div>
              )}
            </div>
            
            {/* Form Section */}
            <div className="md:w-1/2 p-8">
              <h1 className="text-2xl font-bold text-gray-900">{property.name}</h1>
              <p className="text-gray-500 mt-2 text-sm line-clamp-3">{property.description}</p>
              
              <div className="mt-4 bg-brand-50 p-4 rounded-xl border border-brand-100">
                <p className="text-sm text-brand-800">
                  <span className="font-semibold">Agent {sellerName}</span> invited you to discover this property. Fill out the form below to get more details and pricing.
                </p>
              </div>

              {success ? (
                <div className="mt-8 text-center bg-green-50 p-6 rounded-xl border border-green-200">
                  <CheckCircle size={40} className="text-green-500 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-green-900">Request Received!</h3>
                  <p className="text-green-700 mt-1 text-sm">We'll be in touch with you shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <div className="relative">
                      <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={e => setForm({...form, name: e.target.value})}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <div className="relative">
                      <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="tel"
                        required
                        value={form.phone}
                        onChange={e => setForm({...form, phone: e.target.value})}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                        placeholder="01XXXXXXXXX"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={submitLoading}
                    className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    {submitLoading ? <Loader2 size={18} className="animate-spin" /> : null}
                    {submitLoading ? "Submitting..." : "Get Pricing"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketingLanding;
