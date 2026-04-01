import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  FileText,
  Building,
  User,
  CheckCircle,
  Clock,
  ArrowRightLeft,
  DollarSign,
  X,
  Loader2,
  FolderOpen
} from "lucide-react";

const MySales = () => {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [conversionType, setConversionType] = useState('Booked'); // 'Booked' or 'Sold'
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchMySales();
  }, []);

  const fetchMySales = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/api/seller/my-sales", {
        withCredentials: true,
      });
      setUnits(data.units || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load your sales records.");
    } finally {
      setLoading(false);
    }
  };

  // Filter Logic
  const filteredUnits = units.filter((u) => {
    if (activeTab === "All") return true;
    if (activeTab === "My Bookings (Self)") return u.status === "Booked" && u.ownerType === "self";
    if (activeTab === "Customer Bookings") return u.status === "Booked" && u.ownerType === "customer";
    if (activeTab === "Sold Units") return u.status === "Sold";
    return true;
  });

  // Open Modal Logic
  const handleOpenModal = (unit, action) => {
    setSelectedUnit(unit);
    // Pre-fill existing customer data if converting for an existing customer
    if (unit.ownerType === 'customer') {
      setCustomerName(unit.customerName || '');
      setCustomerPhone(unit.customerPhone || '');
    } else {
      setCustomerName('');
      setCustomerPhone('');
    }

    if (action === 'Transfer') {
      // Transfer to Customer: They can keep it 'Booked' or mark as 'Sold'
      setConversionType('Booked'); 
    } else if (action === 'Convert') {
      // Convert to Sale: Force 'Sold' stat
      setConversionType('Sold');
    }

    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUnit(null);
    setCustomerName('');
    setCustomerPhone('');
    setConversionType('Booked');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUnit) return;

    if (!customerName || !customerPhone) {
      return toast.error("Customer Name and Phone are required.");
    }

    try {
      setIsSubmitting(true);
      const payload = {
        actionType: conversionType,
        customerName,
        customerPhone
      };

      const { data } = await axios.put(`/api/seller/units/${selectedUnit._id}/convert`, payload, {
        withCredentials: true,
      });

      toast.success(data.message || "Unit converted successfully!");
      fetchMySales();
      handleCloseModal();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to convert unit.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <FileText className="w-8 h-8 text-indigo-600" />
          My Sales & Monitoring
        </h1>
        <p className="text-gray-500 text-sm mt-2 max-w-2xl">
          Track your actively managed properties. Transfer your pre-booked units to customers or finalize bookings into sold statuses organically.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-4">
        {["All", "My Bookings (Self)", "Customer Bookings", "Sold Units"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-semibold rounded-full transition ${
              activeTab === tab
                ? "bg-indigo-100 text-indigo-700 shadow-sm border border-indigo-200"
                : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filteredUnits.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-500 border border-dashed border-gray-300 rounded-2xl bg-gray-50/50">
          <FolderOpen className="w-14 h-14 mb-4 text-gray-300" />
          <p className="font-semibold text-gray-700">No units found</p>
          <p className="text-sm">We couldn't find any properties matching this filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUnits.map((unit) => (
            <div key={unit._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col transition hover:shadow-md">
              
              {/* Top Row */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Unit {" "}{unit.unitName}</h3>
                  <p className="flex items-center text-sm font-medium text-gray-500 gap-1.5 mt-1">
                    <Building size={14} className="text-indigo-400" />
                    {unit.propertyId?.name || "Unknown Building"}
                  </p>
                </div>
                {unit.status === 'Sold' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 uppercase tracking-wide">
                    <CheckCircle size={12} /> Sold
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 uppercase tracking-wide">
                    <Clock size={12} /> Booked
                  </span>
                )}
              </div>

              {/* Sub-Badge Owner */}
              <div className="mb-6 flex">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  unit.ownerType === 'self' 
                    ? 'bg-purple-50 text-purple-700 border border-purple-100' 
                    : 'bg-blue-50 text-blue-700 border border-blue-100'
                }`}>
                  <User size={14} /> 
                  {unit.ownerType === 'self' ? "Owner: Self" : `Owner: ${unit.customerName || "Customer"}`}
                </span>
              </div>

              <div className="flex-1"></div> {/* Spacer */}

              {/* Action Buttons */}
              {unit.status === "Booked" && unit.ownerType === "self" && (
                <button
                  onClick={() => handleOpenModal(unit, 'Transfer')}
                  className="w-full py-2.5 bg-indigo-50 text-indigo-700 font-bold rounded-xl hover:bg-indigo-100 transition shadow-sm border border-indigo-100 flex items-center justify-center gap-2"
                >
                  <ArrowRightLeft size={16} /> Transfer to Customer
                </button>
              )}
              {unit.status === "Booked" && unit.ownerType === "customer" && (
                <button
                  onClick={() => handleOpenModal(unit, 'Convert')}
                  className="w-full py-2.5 bg-green-50 text-green-700 font-bold rounded-xl hover:bg-green-100 transition shadow-sm border border-green-100 flex items-center justify-center gap-2"
                >
                  <DollarSign size={16} /> Convert to Sale
                </button>
              )}
               {unit.status === "Sold" && (
                 <div className="w-full py-2.5 bg-gray-50 text-gray-400 font-bold rounded-xl text-center border border-gray-100">
                    Finalized
                 </div>
               )}
            </div>
          ))}
        </div>
      )}

      {/* Conversion Modal */}
      {isModalOpen && selectedUnit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-md w-full relative">
            <button 
              onClick={handleCloseModal} 
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 p-1.5 rounded-full transition"
            >
              <X size={18} />
            </button>
            
            <h3 className="font-extrabold text-gray-900 text-2xl mb-1">
              {selectedUnit.ownerType === 'self' ? 'Transfer Property' : 'Finalize Sale'}
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              {selectedUnit.ownerType === 'self' 
                ? 'Assign this self-booked unit to a customer.' 
                : 'Convert this active customer booking into a finalized sale.'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {selectedUnit.ownerType === 'self' && (
                <div>
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                    Conversion Type
                  </label>
                  <select
                    value={conversionType}
                    onChange={(e) => setConversionType(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                  >
                    <option value="Booked">Transfer as Booked</option>
                    <option value="Sold">Sell Directly</option>
                  </select>
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                  <User size={14} className="text-gray-400" /> Customer Name
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  placeholder="Enter full name"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                  <User size={14} className="text-gray-400" /> Customer Phone
                </label>
                <input
                  type="text"
                  required
                  value={customerPhone}
                  onChange={e => setCustomerPhone(e.target.value)}
                  placeholder="Enter phone number"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                />
              </div>

              <div className="mt-8 flex gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl text-sm hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex flex-1 items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                  Confirm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MySales;
