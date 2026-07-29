import React, { useState, useEffect } from "react";
import axios from "axios";
import { Copy, Plus, CheckCircle, ExternalLink, Loader2 } from "lucide-react";

const MarketingLinks = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const { data } = await axios.get("/api/catalog/properties?limit=100");
        setProperties(data.properties || data);
      } catch (error) {
        console.error("Error fetching properties", error);
      }
    };
    fetchProperties();
  }, []);

  const handleGenerate = async () => {
    if (!selectedProperty) return;
    setLoading(true);
    setGeneratedLink("");
    setCopied(false);
    try {
      const { data } = await axios.post("/api/marketing/link", { propertyId: selectedProperty }, { withCredentials: true });
      const fullUrl = `${window.location.origin}/link/${data.slug}`;
      setGeneratedLink(fullUrl);
    } catch (error) {
      alert("Failed to generate link.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Marketing Links</h1>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 max-w-2xl">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Generate Shareable Link</h2>
        <p className="text-sm text-gray-500 mb-6">
          Create a unique link for a property. When a customer submits their information through this link, the lead will be directly assigned to you.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Property</label>
            <select
              value={selectedProperty}
              onChange={(e) => setSelectedProperty(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white"
            >
              <option value="">-- Choose a property --</option>
              {Array.isArray(properties) && properties.map(p => (
                <option key={p.id || p._id} value={p.id || p._id}>{p.name}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleGenerate}
            disabled={!selectedProperty || loading}
            className="w-full sm:w-auto bg-brand-600 hover:bg-brand-700 text-white font-semibold py-2 px-6 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
            Generate Link
          </button>
        </div>

        {generatedLink && (
          <div className="mt-8 p-5 bg-brand-50 border border-brand-100 rounded-xl">
            <h3 className="text-sm font-medium text-brand-900 mb-2">Your unique marketing link:</h3>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={generatedLink}
                className="flex-1 px-3 py-2 border border-brand-200 rounded-lg bg-white text-gray-700 text-sm focus:outline-none"
              />
              <button
                onClick={handleCopy}
                className="p-2 bg-white border border-brand-200 rounded-lg hover:bg-brand-100 text-brand-700 transition-colors"
                title="Copy Link"
              >
                {copied ? <CheckCircle size={18} className="text-green-500" /> : <Copy size={18} />}
              </button>
              <a
                href={generatedLink}
                target="_blank"
                rel="noreferrer"
                className="p-2 bg-white border border-brand-200 rounded-lg hover:bg-brand-100 text-brand-700 transition-colors"
                title="Open Link"
              >
                <ExternalLink size={18} />
              </a>
            </div>
            {copied && <p className="text-xs text-green-600 mt-2 font-medium">Link copied to clipboard!</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketingLinks;
