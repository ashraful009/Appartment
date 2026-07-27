import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { Clock, Building2, Plus, ChevronRight, ChevronDown } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import InvestmentStatusPanel from "./InvestmentStatusPanel";
import BookingCTA from "./BookingCTA";
import DownPaymentCTA from "./DownPaymentCTA";
import InstallmentList from "./InstallmentList";
import AllocatedUnitCard from "./AllocatedUnitCard";
import ProjectsSection from "./ProjectsSection";
import BuildingProgress from "./BuildingProgress";
import { fmtTk } from "./fmt";

const STATUS_PILL = {
  pending_booking: { label: "Awaiting Approval", cls: "bg-amber-50 text-amber-700 border-amber-200" },
  member:          { label: "Member",            cls: "bg-blue-50 text-blue-700 border-blue-200" },
  investor:        { label: "Investor",          cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  lapsed:          { label: "Lapsed",            cls: "bg-red-50 text-red-700 border-red-200" },
};

const IN_PROGRESS = ["Pending", "AccountantConfirmed", "DataEntryConfirmed"];


const InvestmentPanel = ({ title = "Investment Dashboard" }) => {
  const { refreshUser } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [showBooking, setShowBooking] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/membership/me", { withCredentials: true });
      setData(data);
    } catch {
      setData({ memberships: [], items: [] });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const reload = useCallback(async () => {
    await load();
    await refreshUser();
    setShowBooking(false);
  }, [load, refreshUser]);

  if (loading) {
    return (
      <div className="p-8 space-y-4">
        <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const { items = [] } = data || {};
  const hasAnyInvestor = items.some((it) => it.membership?.status === "investor");
  const hasAnyMember = items.some((it) =>
    ["member", "investor"].includes(it.membership?.status)
  );

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">{title}</h1>
          <p className="text-gray-500 text-sm mt-1">
            Your property investment journeys — booking, down payment & installments.
          </p>
        </div>
        
        <button
          onClick={() => { setShowBooking(true); setExpandedId(null); }}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white text-sm font-bold rounded-xl hover:bg-brand-700 transition-colors shadow-sm"
        >
          <Plus size={16} /> Invest in New Property
        </button>
      </div>

      
      {showBooking && (
        <BookingCTA onSubmitted={reload} onCancel={() => setShowBooking(false)} />
      )}

      
      {items.length === 0 && !showBooking && (
        <BookingCTA onSubmitted={reload} />
      )}

      
      {items.length > 0 && (
        <div className="space-y-4">
          {items.map((item) => {
            const { membership, ledger = [], summary, allocatedUnit } = item;
            const status = membership?.status;
            const pill = STATUS_PILL[status] || STATUS_PILL.pending_booking;
            const property = membership?.propertyId;
            const isExpanded = expandedId === membership?._id;
            const installments = ledger.filter((e) => e.type === "installment");
            const downpaymentPending = ledger.some(
              (e) => e.type === "downpayment" && IN_PROGRESS.includes(e.status)
            );

            return (
              <div
                key={membership._id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all"
              >
                
                <button
                  onClick={() => setExpandedId(isExpanded ? null : membership._id)}
                  className="w-full flex items-center gap-4 p-5 text-left hover:bg-gray-50/60 transition-colors"
                >
                  
                  <div className="w-16 h-16 rounded-xl bg-gray-100 flex-shrink-0 overflow-hidden">
                    {property?.mainImage ? (
                      <img
                        src={property.mainImage}
                        alt={property.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Building2 size={24} className="text-gray-300" />
                      </div>
                    )}
                  </div>

                  
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-extrabold text-gray-900 truncate">
                      {property?.name || "Investment Journey"}
                    </p>
                    {property?.address && (
                      <p className="text-xs text-gray-400 truncate mt-0.5">
                        {property.address}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1.5">
                      <span
                        className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full border ${pill.cls}`}
                      >
                        {pill.label}
                      </span>
                      {summary && (
                        <span className="text-xs text-gray-400">
                          Paid: {fmtTk(summary.totalPaid)}
                        </span>
                      )}
                    </div>
                  </div>

                  
                  {status === "investor" && summary && (
                    <div className="hidden sm:block text-right flex-shrink-0">
                      <p className="text-xs text-gray-400">Installments</p>
                      <p className="text-sm font-bold text-gray-800">
                        {summary.installmentsPaidCount}/{summary.installmentsTotal}
                      </p>
                    </div>
                  )}

                  
                  <div className="flex-shrink-0 text-gray-300">
                    {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                  </div>
                </button>

                
                {isExpanded && (
                  <div className="border-t border-gray-100 p-5 space-y-5 bg-gray-50/30">
                    
                    {status === "pending_booking" && (
                      <div className="bg-white rounded-xl border border-gray-100 p-6 text-center">
                        <Clock size={28} className="text-amber-500 mx-auto mb-3" />
                        <h3 className="text-lg font-bold text-gray-800">Booking under review</h3>
                        <p className="text-gray-500 text-sm mt-1">
                          Your booking money is submitted. You'll become a member once approved.
                        </p>
                      </div>
                    )}

                    
                    {status === "lapsed" && (
                      <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-5 text-center text-sm">
                        <h3 className="font-bold">Membership lapsed</h3>
                        <p className="mt-1">
                          The 6-month window to complete your down payment expired.
                        </p>
                      </div>
                    )}

                    
                    {(status === "member" || status === "investor") && (
                      <InvestmentStatusPanel membership={membership} summary={summary} />
                    )}

                    
                    {status === "member" && (
                      <DownPaymentCTA
                        membership={membership}
                        pending={downpaymentPending}
                        onSubmitted={reload}
                      />
                    )}

                    
                    {status === "investor" && allocatedUnit && (
                      <div>
                        <h3 className="text-sm font-bold text-gray-700 mb-2">Allocated Unit</h3>
                        <AllocatedUnitCard unit={allocatedUnit} />
                      </div>
                    )}

                    
                    {(status === "member" || status === "investor") && (property?.progressVideoUrl || (property?.progressImages && property?.progressImages.length > 0)) && (
                      <div>
                        <h3 className="text-sm font-bold text-gray-700 mb-2">Construction Progress</h3>
                        <BuildingProgress videoUrl={property.progressVideoUrl} images={property.progressImages} />
                      </div>
                    )}

                    
                    {status === "investor" && (
                      <div>
                        <h3 className="text-sm font-bold text-gray-700 mb-2">Installments</h3>
                        <InstallmentList
                          installments={installments}
                          membershipId={membership._id}
                          onPaid={reload}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      
      {hasAnyMember && (
        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-3">Projects</h2>
          <ProjectsSection />
        </div>
      )}
    </div>
  );
};

export default InvestmentPanel;
