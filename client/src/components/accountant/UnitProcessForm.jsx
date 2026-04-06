import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { X, Save, Loader2, Building2, User, MapPin } from "lucide-react";

const UnitProcessForm = ({ unit, onClose, onSuccess }) => {
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [specs, setSpecs] = useState({
    squareFt: "",
    bedrooms: "",
    washrooms: "",
    kitchen: "",
    balconies: "",
    drawingRoom: "",
    dining: "",
  });

  const [financials, setFinancials] = useState({
    unitPrice: "",
    bookingMoney: "",
    downPayment: "",
    parkingCharge: "",
    financialServiceCharge: "",
    latePaymentPenalty: "",
    serviceCharge: "",
  });

  // Pre-fill existing data if any
  useEffect(() => {
    if (unit) {
      if (unit.isDocumentReady) {
        setSpecs({
          squareFt: unit.specs?.squareFt || "",
          bedrooms: unit.specs?.bedrooms || "",
          washrooms: unit.specs?.washrooms || "",
          kitchen: unit.specs?.kitchen || "",
          balconies: unit.specs?.balconies || "",
          drawingRoom: unit.specs?.drawingRoom || "",
          dining: unit.specs?.dining || "",
        });

        setFinancials({
          unitPrice: unit.financials?.unitPrice || "",
          bookingMoney: unit.financials?.bookingMoney || "",
          downPayment: unit.financials?.downPayment || "",
          parkingCharge: unit.financials?.parkingCharge || "",
          financialServiceCharge: unit.financials?.financialServiceCharge || "",
          latePaymentPenalty: unit.financials?.latePaymentPenalty || "",
          serviceCharge: unit.financials?.serviceCharge || "",
        });
      }
    }
  }, [unit]);

  const handleSpecsChange = (e) => {
    setSpecs({ ...specs, [e.target.name]: e.target.value });
  };

  const handleFinancialsChange = (e) => {
    setFinancials({ ...financials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!unit) return;

    try {
      setSubmitting(true);
      const payload = {
        specs,
        financials,
      };

      await axios.put(`/api/accountant/units/${unit._id}/details`, payload, {
        withCredentials: true,
      });

      toast.success("Document Prepared Successfully");
      onSuccess(); // Refresh parent list
      onClose(); // Close modal
    } catch (error) {
      console.error(error);
      toast.error("Failed to prepare document.");
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate dynamic Total Payable
  const calculateTotal = () => {
    const fieldsToSum = [
      "unitPrice",
      "bookingMoney",
      "parkingCharge",
      "financialServiceCharge",
      "serviceCharge",
    ];
    let total = 0;
    fieldsToSum.forEach((key) => {
      const val = parseFloat(financials[key]);
      if (!isNaN(val)) total += val;
    });
    return total;
  };

  const totalPayable = calculateTotal();

  if (!unit) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex justify-between items-center px-8 py-5 border-b bg-gray-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Process Document: {unit.unitName}</h2>
            <p className="text-sm text-gray-500 mt-1">Review and complete processing for this property unit.</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-8 overflow-y-auto w-full custom-scrollbar">
          <form id="process-form" onSubmit={handleSubmit} className="space-y-10">
            {/* Section 1: Building & Sale Overview */}
            <section className="bg-indigo-50/50 rounded-xl p-6 border border-indigo-100">
              <h3 className="text-lg font-bold text-indigo-900 mb-4 border-b border-indigo-200 pb-2">
                Section 1: Building & Sale Overview
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex gap-4 items-start">
                  <div className="p-3 bg-white rounded-lg shadow-sm">
                    <Building2 className="w-6 h-6 text-indigo-500" />
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      Building Details
                    </span>
                    <p className="font-semibold text-gray-900 text-lg">{unit.propertyId?.name || "N/A"}</p>
                    <p className="flex items-center text-sm text-gray-600 mt-1 gap-1">
                      <MapPin size={14} className="text-gray-400" />
                      {unit.propertyId?.address || "Address not available"}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="p-3 bg-white rounded-lg shadow-sm">
                    <User className="w-6 h-6 text-indigo-500" />
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      Action By
                    </span>
                    <p className="font-semibold text-gray-900 text-lg">{unit.actionBy?.name || "System"}</p>
                    <p className="text-sm text-gray-600 mt-1">Status: {unit.status}</p>
                  </div>
                </div>

                {/* New Owner Info Blocks */}
                <div className="flex gap-4 items-start">
                  <div className="p-3 bg-white rounded-lg shadow-sm">
                    <User className="w-6 h-6 text-indigo-500" />
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      Owner Name
                    </span>
                    <p className="font-semibold text-gray-900 text-lg">
                      {unit.status === 'Booked' && !unit.customerName 
                        ? 'N/A (Booked by Agent/Seller)' 
                        : (unit.customerName || 'N/A')}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="p-3 bg-white rounded-lg shadow-sm">
                    <User className="w-6 h-6 text-indigo-500" />
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      Owner Phone
                    </span>
                    <p className="font-semibold text-gray-900 text-lg">
                      {unit.customerPhone || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 2: Apartment Specifications */}
            <section>
              <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">
                Section 2: Apartment Specifications
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {[
                  { label: "Square Ft.", name: "squareFt" },
                  { label: "Bedrooms", name: "bedrooms" },
                  { label: "Washrooms", name: "washrooms" },
                  { label: "Kitchens", name: "kitchen" },
                  { label: "Balconies", name: "balconies" },
                  { label: "Drawing Room", name: "drawingRoom" },
                  { label: "Dining", name: "dining" },
                ].map((field) => (
                  <div key={field.name}>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">{field.label}</label>
                    <input
                      type="number"
                      name={field.name}
                      value={specs[field.name]}
                      onChange={handleSpecsChange}
                      placeholder="e.g. 1"
                      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    />
                  </div>
                ))}
              </div>
            </section>

            {/* Section 3: Financial Summary */}
            <section>
              <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Section 3: Financial Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: "Unit Price", name: "unitPrice" },
                  { label: "Booking Money", name: "bookingMoney" },
                  { label: "Down Payment", name: "downPayment" },
                  { label: "Parking Charge", name: "parkingCharge" },
                  { label: "Fin. Service Charge", name: "financialServiceCharge" },
                  { label: "Late Payment Penalty", name: "latePaymentPenalty" },
                  { label: "Service Charge", name: "serviceCharge" },
                ].map((field) => (
                  <div key={field.name} className="col-span-1">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">{field.label}</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 font-medium">
                        ৳
                      </span>
                      <input
                        type="number"
                        name={field.name}
                        value={financials[field.name]}
                        onChange={handleFinancialsChange}
                        placeholder="0.00"
                        className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-gray-900 font-semibold"
                      />
                    </div>
                  </div>
                ))}

                {/* Dynamic Total Payable */}
                <div className="col-span-1 lg:col-span-4 mt-2">
                  <div className="bg-indigo-600 text-white rounded-xl p-5 shadow-lg flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                      <h4 className="text-indigo-100 font-medium text-sm">Dynamic Calculation</h4>
                      <p className="text-xl font-bold">Total Payable Amount</p>
                    </div>
                    <div className="text-3xl font-extrabold tracking-tight">৳ {totalPayable.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            </section>
          </form>
        </div>

        {/* Modal Footer */}
        <div className="px-8 py-5 border-t bg-white flex justify-end gap-4 shadow-inner">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition shadow-sm"
          >
            Cancel
          </button>
          <button
            form="process-form"
            type="submit"
            disabled={submitting}
            className="px-8 py-2.5 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition shadow-md flex items-center gap-2 disabled:opacity-70 text-lg"
          >
            {submitting ? (
              <>
                <Loader2 size={20} className="animate-spin" /> Processing...
              </>
            ) : (
              <>
                <Save size={20} /> Prepare Document
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnitProcessForm;
