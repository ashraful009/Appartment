import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from 'react-router-dom';
import { X, User, Phone, CheckCircle, ShieldCheck, Loader2, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';

const PropertyVisualizer = ({ totalUnits, totalFloors, units, viewerRole = 'public' }) => {
  const { user } = useAuth();
  const location = useLocation();

  // ── Derive which role context this panel is operating under ───────────────
  // Matches the path prefix to the role the user is acting as right now.
  // Falls back to null for unknown contexts (will be caught by backend validation).
  const activeContext = location.pathname.startsWith('/admin-panel')
    ? 'admin'
    : location.pathname.startsWith('/seller-panel')
    ? 'seller'
    : null;
  
  const [localUnits, setLocalUnits] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [modalType, setModalType] = useState(null); // 'actionForm' or 'infoModal'
  
  // Form State
  const [bookingTarget, setBookingTarget] = useState('customer'); // 'own' or 'customer'
  const [actionType, setActionType] = useState('Sold'); // 'Booked' or 'Sold'
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (units) {
      setLocalUnits(units);
    }
  }, [units]);

  const numFloors = Number(totalFloors) || 0;
  const numUnits = Number(totalUnits) || 0;

  if (numFloors <= 0 || numUnits <= 0) {
    return (
      <div className="flex items-center justify-center p-8 bg-gray-50 border border-dashed border-gray-200 rounded-2xl">
        <p className="text-gray-400 text-sm font-medium">Enter total units and floors to see the preview</p>
      </div>
    );
  }

  const unitsPerFloor = Math.floor(numUnits / numFloors);

  if (unitsPerFloor === 0) {
    return (
      <div className="flex items-center justify-center p-8 bg-red-50 border border-dashed border-red-200 rounded-2xl">
        <p className="text-red-500 text-sm font-medium">Units per floor must be at least 1</p>
      </div>
    );
  }

  const unitMap = {};
  if (localUnits && Array.isArray(localUnits)) {
    localUnits.forEach(u => {
      unitMap[u.unitName] = u;
    });
  }

  const handleUnitClick = (unitName, cellUnit) => {
    if (viewerRole === 'public') return;
    
    // If unit hasn't been saved to DB yet (preview mode)
    if (!cellUnit || !cellUnit._id) {
      toast.error("Unit must be saved to the database first.", { id: 'unsaved-unit' });
      return;
    }

    if (cellUnit.status === 'Unsold') {
      setSelectedUnit(cellUnit);
      setModalType('actionForm');
      setCustomerName('');
      setCustomerPhone('');
      setBookingTarget('customer');
      setActionType('Sold');
    } else if (cellUnit.status === 'Sold' || cellUnit.status === 'Booked') {
      setSelectedUnit(cellUnit);
      setModalType('infoModal');
    }
  };

  const submitAction = async () => {
    if (bookingTarget === 'customer' && actionType === 'Sold' && (!customerName || !customerPhone)) {
      return toast.error("Customer name and phone are required for Sold units.");
    }
    
    setIsSubmitting(true);
    try {
      const payload = {
        actionType: bookingTarget === 'own' ? 'Booked' : actionType,
        customerName: bookingTarget === 'own' ? user.name : customerName,
        customerPhone: bookingTarget === 'own' ? user.phone : customerPhone,
        actionRoleContext: activeContext,
      };

      const { data } = await axios.put(`/api/units/${selectedUnit._id}/action`, payload, {
        withCredentials: true
      });

      toast.success(data.message || "Unit updated.");
      
      // Update local state
      setLocalUnits(prev => prev.map(u => u._id === selectedUnit._id ? data.unit : u));
      
      closeModal();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update unit.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => {
    setSelectedUnit(null);
    setModalType(null);
    setCustomerName('');
    setCustomerPhone('');
    setBookingTarget('customer');
    setActionType('Sold');
  };

  const getUnitStyle = (status) => {
    switch (status) {
      case 'Sold':        return 'bg-orange-500 text-white border-orange-600';
      case 'Booked':      return 'bg-green-500 text-white border-green-600';
      case 'Unsold':
      default:            return 'bg-white text-gray-800 border-gray-300';
    }
  };

  const floorsGrid = Array.from({ length: numFloors }, (_, k) => numFloors - k);

  const renderActionFormModal = () => {
    if (!selectedUnit) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-md w-full relative transform transition-all">
          <button onClick={closeModal} className="absolute top-5 right-5 text-gray-400 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 p-1.5 rounded-full transition">
            <X size={18} />
          </button>
          
          <h3 className="font-extrabold text-gray-900 text-2xl mb-1">Book / Sell: {selectedUnit?.unitName}</h3>
          <p className="text-gray-500 text-sm mb-6">Select action and provide customer details if selling.</p>

          {/* Auto-filled Header - User Info */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-indigo-600" />
                <span className="font-bold text-gray-800 text-sm">{user?.name || "Unknown User"}</span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-md">
                {user?.roles?.[0] || viewerRole}
              </span>
            </div>
            <div className="text-xs text-gray-500 flex justify-between">
              <span>{user?.phone || 'No phone'}</span>
              <span>{new Date().toLocaleDateString()}</span>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex bg-gray-100 p-1.5 rounded-xl">
              <button
                onClick={() => {
                  setBookingTarget('own');
                  setActionType('Booked');
                  setCustomerName('');
                  setCustomerPhone('');
                }}
                className={`flex-1 py-1.5 text-sm font-bold rounded-lg transition-all ${
                  bookingTarget === 'own' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                For Own
              </button>
              <button
                onClick={() => setBookingTarget('customer')}
                className={`flex-1 py-1.5 text-sm font-bold rounded-lg transition-all ${
                  bookingTarget === 'customer' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                For Customer
              </button>
            </div>

            {bookingTarget === 'own' ? (
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 text-center">
                <ShieldCheck size={28} className="text-indigo-500 mx-auto mb-2" />
                <p className="text-sm font-bold text-indigo-900">Book Under Your Name</p>
                <p className="text-xs text-indigo-700 mt-1">
                  This unit will be booked under your name and phone number.
                </p>
              </div>
            ) : (
              <div className="space-y-4 bg-white border border-gray-100 shadow-sm rounded-xl p-5">
                <div>
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                    Action Type
                  </label>
                  <select
                    value={actionType}
                    onChange={(e) => setActionType(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                  >
                    <option value="Booked">Book</option>
                    <option value="Sold">Sell</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                    <User size={14} className="text-gray-400" /> Customer Name
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    placeholder="Enter full name"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                    <Phone size={14} className="text-gray-400" /> Customer Phone
                  </label>
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                    placeholder="Enter phone number"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 flex gap-3">
            <button
              onClick={closeModal}
              className="flex-1 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl text-sm hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={submitAction}
              disabled={isSubmitting}
              className="flex flex-1 items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
              Confirm Action
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderInfoModal = () => {
    if (!selectedUnit) return null;
    const StatusBadge = selectedUnit?.status === 'Sold' 
      ? <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">Sold</span>
      : <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">Booked</span>;

    const actionBy = selectedUnit?.actionBy;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-sm w-full relative transform transition-all">
          <div className="bg-gray-50 p-6 pr-12 border-b border-gray-200 relative">
             <button onClick={closeModal} className="absolute top-5 right-5 text-gray-400 hover:text-gray-900 bg-white shadow-sm hover:shadow p-1.5 rounded-full transition border border-gray-100">
               <X size={18} />
             </button>
             <h3 className="font-extrabold text-gray-900 text-xl flex items-center gap-3">
               Unit {selectedUnit?.unitName} {StatusBadge}
             </h3>
          </div>

          <div className="p-6 space-y-6">
            {/* Action By Section */}
            {actionBy && (
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Processed By</p>
                <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold">
                    {actionBy.name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800 leading-tight">{actionBy.name}</p>
                    <p className="text-xs text-gray-500">
                      {/* Show the stored role context (e.g. "admin", "seller") — capitalize it */}
                      {selectedUnit?.actionRoleContext
                        ? selectedUnit.actionRoleContext.charAt(0).toUpperCase() +
                          selectedUnit.actionRoleContext.slice(1)
                        : 'Staff'}
                      {actionBy.phone ? ` • ${actionBy.phone}` : ''}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Customer Section */}
            {(selectedUnit?.customerName || selectedUnit?.customerPhone) ? (
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
                <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3">Customer Info</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-indigo-900 font-medium text-sm">
                    <User size={16} className="text-indigo-400" /> {selectedUnit.customerName || "N/A"}
                  </div>
                  <div className="flex items-center gap-2 text-indigo-900 font-medium text-sm">
                    <Phone size={16} className="text-indigo-400" /> {selectedUnit.customerPhone || "N/A"}
                  </div>
                </div>
              </div>
            ) : (
                <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-4 text-center">
                   <p className="text-xs text-gray-400 font-medium">No Customer Details Registered</p>
                </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full space-y-6">
      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-6 text-[10px] font-bold uppercase tracking-wider text-gray-600 bg-gray-50/80 py-3 px-6 rounded-2xl border border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded-full border border-gray-300 bg-white shadow-sm"></div>
          <span>Unsold</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded-full border-[3px] border-orange-600 bg-orange-500 shadow-sm"></div>
          <span>Sold</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded-full border-[3px] border-green-600 bg-green-500 shadow-sm"></div>
          <span>Booked</span>
        </div>
      </div>

      {/* Building visualizer */}
      <div className="bg-white border flex flex-col items-center justify-center border-gray-200 rounded-3xl p-6 shadow-sm overflow-x-auto">
        <div className="min-w-max flex flex-col gap-3">
          {floorsGrid.map((floor) => (
            <div key={floor} className="flex items-center gap-4">
              {/* Floor Label */}
              <div className="w-16 text-right pr-4 border-r-2 border-dashed border-gray-200 py-1">
                <span className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest">
                  FL {floor}
                </span>
              </div>
              
              {/* Units */}
              <div className="flex items-center gap-3 py-1">
                {Array.from({ length: unitsPerFloor }, (_, i) => {
                  const letter = String.fromCharCode(65 + i); // 65 is 'A'
                  const unitName = `${letter}-${floor}`;
                  const cellUnit = unitMap[unitName] || null;
                  const status = cellUnit ? cellUnit.status : 'Unsold';
                  const styleStr = getUnitStyle(status);
                  
                  return (
                    <div
                      key={unitName}
                      onClick={() => handleUnitClick(unitName, cellUnit)}
                      className={`rounded-full border font-bold text-xs py-2 px-5 shadow-sm text-center min-w-[70px] ${
                        viewerRole === 'public' ? 'cursor-default' : 'cursor-pointer hover:shadow-md hover:scale-105 transition-all'
                      } ${styleStr}`}
                    >
                      {unitName}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Ground Floor */}
          <div className="flex items-center gap-4 mt-1">
             <div className="w-16 text-right pr-4 border-r-2 border-dashed border-gray-200 py-2">
                <span className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest">
                  GF
                </span>
             </div>
             <div className="flex-1 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl py-3 px-6 flex items-center justify-center min-w-[300px]">
                <span className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest">
                  Ground Floor / Lobby
                </span>
             </div>
          </div>
        </div>
      </div>
      
      {modalType === 'actionForm' && renderActionFormModal()}
      {modalType === 'infoModal' && renderInfoModal()}
    </div>
  );
};

export default PropertyVisualizer;
