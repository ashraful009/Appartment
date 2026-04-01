import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Building2, MapPin, CalendarDays, Tag, CheckCircle, ShoppingBag, User, Calendar, Building, UserCircle, CircleDollarSign, Maximize, Bed, Bath, ChefHat, Layout } from "lucide-react";
import InstallmentTable from "../../components/customer/journey/InstallmentTable";

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  Sold:   { label: "Sold",   classes: "bg-orange-100 text-orange-700 border-orange-200" },
  Booked: { label: "Booked", classes: "bg-emerald-100 text-emerald-700 border-emerald-200" },
};

// ── Skeleton card ─────────────────────────────────────────────────────────────
const UnitCardSkeleton = () => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden w-full max-w-7xl mx-auto mb-6 flex flex-col animate-pulse">
    <div className="flex flex-col sm:flex-row w-full">
      {/* Image placeholder */}
      <div className="w-full sm:w-48 h-32 sm:h-auto bg-gray-200 shrink-0" />
      {/* Text placeholders */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="h-6 w-32 bg-gray-200 rounded-lg mb-1" />
          <div className="h-3 w-20 bg-gray-200 rounded-full mb-3" />
          <div className="mt-2">
            <div className="h-4 w-48 bg-gray-100 rounded mb-1.5" />
            <div className="h-4 w-64 bg-gray-100 rounded mb-2" />
          </div>
        </div>
        <div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-1.5 gap-x-3 mt-1 border-t border-gray-100 pt-2">
            <div className="h-3 w-24 bg-gray-100 rounded" />
            <div className="h-3 w-32 bg-gray-100 rounded" />
            <div className="h-3 w-28 bg-gray-100 rounded" />
            <div className="h-3 w-24 bg-gray-100 rounded" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

// ── Empty state ───────────────────────────────────────────────────────────────
const EmptyState = () => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 flex flex-col items-center text-center gap-5">
    <div className="w-20 h-20 rounded-3xl bg-gray-50 border border-gray-100 flex items-center justify-center">
      <Building2 size={36} className="text-gray-300" />
    </div>
    <div>
      <h2 className="text-lg font-semibold text-gray-700">
        You haven't booked any apartments yet
      </h2>
      <p className="text-sm text-gray-400 mt-1.5 max-w-sm">
        Once a unit is booked or sold under your account, all the details will
        automatically appear here.
      </p>
    </div>
    {/* Info chips */}
    <div className="flex flex-wrap justify-center gap-3 mt-1">
      {[
        { icon: MapPin,       label: "Location" },
        { icon: CalendarDays, label: "Booking Date" },
        { icon: Tag,          label: "Unit Details" },
      ].map(({ icon: Icon, label }) => (
        <span
          key={label}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-100 text-xs font-medium text-gray-400"
        >
          <Icon size={12} />
          {label}
        </span>
      ))}
    </div>
  </div>
);

// ── Expandable Unit Card ──────────────────────────────────────────────────────
const ExpandableUnitCard = ({ unit }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('plotDetails'); // 'plotDetails' | 'installments'

  const property  = unit.propertyId || {};
  const status    = STATUS_CONFIG[unit.status] ?? STATUS_CONFIG.Booked;
  const bookedAt  = unit.updatedAt
    ? new Date(unit.updatedAt).toLocaleDateString("en-GB", {
        day: "2-digit", month: "short", year: "numeric",
      })
    : "—";

  const actionText = unit.status === "Sold" ? "Sold" : "Booked";
  const actionByName = unit.actionBy?.name || "System";

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 overflow-hidden w-full max-w-7xl mx-auto mb-6 flex flex-col">
      
      {/* ── Main Card (Clickable) ─────────────────────────────────────────────── */}
      <div 
        className="flex flex-col sm:flex-row cursor-pointer group w-full"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* ── Left/Top — Property image ──────────────────────────────────────── */}
        <div className="relative w-full sm:w-48 shrink-0 bg-gray-100">
          {property.mainImage ? (
            <img
              src={property.mainImage}
              alt={property.name || "Property"}
              className="w-full h-32 sm:h-full object-cover group-hover:opacity-90 transition-opacity duration-300"
            />
          ) : (
            <div className="w-full h-32 sm:h-full flex items-center justify-center">
              <Building2 size={32} className="text-gray-300" />
            </div>
          )}
          {/* Floating status badge on image */}
          <div className={`absolute top-2 left-2 px-3 py-1 text-[10px] font-bold rounded-full tracking-wider uppercase backdrop-blur-sm border ${status.classes}`}>
            {status.label}
          </div>
        </div>

        {/* ── Right/Bottom — Dense Details ────────────────────────────────────────────── */}
        <div className="p-4 flex-1 flex flex-col justify-between">
          <div>
            {/* Header Row (Compact) */}
            <h2 className="text-xl font-extrabold text-brand-700 leading-tight">
              Unit {unit.unitName || "—"}
            </h2>
            <span className="text-xs font-semibold text-gray-400 tracking-wide uppercase">
              Unit Number
            </span>

            {/* Main Details Stack (Dense) */}
            <div className="mt-2">
              <p className="text-gray-800 font-medium text-sm mb-0.5">
                Owner: <span className="font-bold">{unit.customerName || 'N/A'}</span>
              </p>
              <p className="text-gray-600 text-sm mb-1.5 font-semibold">
                Building: {property.name || "Unknown Building"}
              </p>
              {property.address && (
                <div className="flex items-start gap-1.5 text-gray-500 text-sm mb-2">
                  <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" /> 
                  <span>{property.address}</span>
                </div>
              )}
            </div>
          </div>

          <div>
            {/* Footer Meta-Data Row (Dense Grid) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-y-1.5 gap-x-3 text-xs text-gray-500 mt-1 border-t border-gray-100 pt-2">
              {/* Item 1 */}
              <div className="flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5" /> Floor {unit.floor}
              </div>

              {/* Item 2 */}
              <div className="flex items-center gap-1.5">
                <CalendarDays className="w-3.5 h-3.5" /> Handover {unit.propertyId?.handoverTime || 'N/A'}
              </div>

              {/* Item 3 */}
              <div className="flex items-center gap-1.5">
                <UserCircle className="w-3.5 h-3.5" /> Sold by <span className="font-medium text-gray-700">{actionByName}</span>
              </div>

              {/* Item 4 */}
              <div className="flex items-center gap-1.5">
                <CircleDollarSign className="w-3.5 h-3.5" /> Status: {unit.status}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Expanded Section (Dropdown Menu) ─────────────────────────────────── */}
      {isExpanded && (
        <div className="border-t border-gray-100 bg-gray-50 p-6">
          {/* Tab Menu */}
          <div className="flex gap-6 border-b border-gray-200 mb-6">
            <button
              onClick={(e) => { e.stopPropagation(); setActiveTab('plotDetails'); }}
              className={`pb-2 text-sm font-semibold transition duration-200 ${
                activeTab === 'plotDetails'
                  ? 'border-b-2 border-brand-600 text-brand-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Plot Details
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setActiveTab('installments'); }}
              className={`pb-2 text-sm font-semibold transition duration-200 ${
                activeTab === 'installments'
                  ? 'border-b-2 border-brand-600 text-brand-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Installments
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'plotDetails' ? (
            <div className="flex flex-col gap-8">
              
              {/* Section 1: Building Overview */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 border-b border-gray-200 pb-2 mb-4">1. Building Overview</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div>
                    <p className="text-xs text-gray-500">Total Units</p>
                    <p className="text-sm font-bold text-gray-800">{unit.propertyId?.totalUnits || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Floors</p>
                    <p className="text-sm font-bold text-gray-800">{unit.propertyId?.floors || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Land Size</p>
                    <p className="text-sm font-bold text-gray-800">{unit.propertyId?.landSize || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Handover</p>
                    <p className="text-sm font-bold text-gray-800">{unit.propertyId?.handoverTime || 'N/A'}</p>
                  </div>
                  <div className="col-span-2 md:col-span-4 mt-2">
                    <p className="text-xs text-gray-500">Parking</p>
                    <p className="text-sm font-bold text-gray-800">{unit.propertyId?.parkingArea || 'N/A'}</p>
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="text-sm font-semibold text-gray-800 mb-2">About the Property</h4>
                  <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
                    {unit.propertyId?.description || 'No description provided by the admin.'}
                  </p>
                </div>
              </div>

              {/* Conditional Rendering for Specs & Financials */}
              {!unit.isDocumentReady ? (
                <div className="p-8 text-center bg-orange-50 border border-orange-100 rounded-xl mt-6">
                  <p className="text-orange-600 font-semibold">Your document is not ready yet. Please wait for the accountant to process it.</p>
                </div>
              ) : (
                <>
                  {/* Section 2: Flat Specifications */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 border-b border-gray-200 pb-2 mb-4">2. Apartment Specifications</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-6">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-brand-50 rounded-md text-brand-600"><Maximize size={16} /></div>
                        <div><p className="text-xs text-gray-500">Square Ft</p><p className="font-semibold text-gray-800">{unit.specs?.squareFt || '—'} sqft</p></div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-brand-50 rounded-md text-brand-600"><Bed size={16} /></div>
                        <div><p className="text-xs text-gray-500">Bedrooms</p><p className="font-semibold text-gray-800">{unit.specs?.bedrooms || '—'} Beds</p></div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-brand-50 rounded-md text-brand-600"><Bath size={16} /></div>
                        <div><p className="text-xs text-gray-500">Washrooms</p><p className="font-semibold text-gray-800">{unit.specs?.washrooms || '—'} Baths</p></div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-brand-50 rounded-md text-brand-600"><ChefHat size={16} /></div>
                        <div><p className="text-xs text-gray-500">Kitchen</p><p className="font-semibold text-gray-800">{unit.specs?.kitchen || '—'}</p></div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-brand-50 rounded-md text-brand-600"><Layout size={16} /></div>
                        <div><p className="text-xs text-gray-500">Balcony</p><p className="font-semibold text-gray-800">{unit.specs?.balconies || '—'}</p></div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-brand-50 rounded-md text-brand-600"><Layout size={16} /></div>
                        <div><p className="text-xs text-gray-500">Drawing Room</p><p className="font-semibold text-gray-800">{unit.specs?.drawingRoom || '—'}</p></div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-brand-50 rounded-md text-brand-600"><Layout size={16} /></div>
                        <div><p className="text-xs text-gray-500">Dining</p><p className="font-semibold text-gray-800">{unit.specs?.dining || '—'}</p></div>
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Financial Summary */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 border-b border-gray-200 pb-2 mb-4">3. Financial Summary</h3>
                    <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm max-w-2xl">
                      <div className="flex justify-between items-center py-2 border-b border-gray-50 text-sm">
                        <span className="text-gray-600">Unit Price</span> <span className="font-medium text-gray-800">৳ {unit.financials?.unitPrice?.toLocaleString() || '0'}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-50 text-sm">
                        <span className="text-gray-600">Booking Money</span> <span className="font-medium text-gray-800">৳ {unit.financials?.bookingMoney?.toLocaleString() || '0'}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-50 text-sm">
                        <span className="text-gray-600">Down Payment</span> <span className="font-medium text-gray-800">৳ {unit.financials?.downPayment?.toLocaleString() || '0'}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-50 text-sm">
                        <span className="text-gray-600">Parking Charge</span> <span className="font-medium text-gray-800">৳ {unit.financials?.parkingCharge?.toLocaleString() || '0'}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-50 text-sm">
                        <span className="text-gray-600">Financial Service Charge</span> <span className="font-medium text-gray-800">৳ {unit.financials?.financialServiceCharge?.toLocaleString() || '0'}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-50 text-sm">
                        <span className="text-gray-600">Late Payment Penalty</span> <span className="font-medium text-red-500">৳ {unit.financials?.latePaymentPenalty?.toLocaleString() || '0'}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 text-sm">
                        <span className="text-gray-600">Service Charge</span> <span className="font-medium text-gray-800">৳ {unit.financials?.serviceCharge?.toLocaleString() || '0'}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 mt-2 border-t border-gray-200 text-base">
                        <span className="text-gray-900 font-bold">Total Payable Amount</span> <span className="font-bold text-brand-700">৳ {unit.financials?.totalPayable?.toLocaleString() || '0'}</span>
                      </div>
                    </div>
                  </div>
                </>
              )}

            </div>
          ) : (
            <div className="mt-4">
              <InstallmentTable />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ── Page ──────────────────────────────────────────────────────────────────────
const MyAppartment = () => {
  const [units,   setUnits]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyUnits = async () => {
      try {
        const { data } = await axios.get("/api/customer/my-units", {
          withCredentials: true,
        });
        if (data.success) setUnits(data.units ?? []);
      } catch (err) {
        const msg = err?.response?.data?.message || "Failed to load your apartments.";
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchMyUnits();
  }, []);

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">

      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-widest text-brand-500 mb-1">
          Customer Panel
        </p>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-600 flex items-center justify-center shadow-md shadow-brand-200 flex-shrink-0">
            <Building2 size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 leading-tight">
              My Apartment
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Your property booking details at a glance
              {!loading && units.length > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-brand-50 text-brand-600 text-xs font-bold rounded-full">
                  {units.length} unit{units.length !== 1 ? "s" : ""}
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="flex flex-col w-full">
          <UnitCardSkeleton />
          <UnitCardSkeleton />
        </div>
      ) : units.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="flex flex-col w-full">
          {units.map((unit) => (
            <ExpandableUnitCard key={unit._id} unit={unit} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyAppartment;
