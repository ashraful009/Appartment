import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { ClipboardList, CreditCard, Inbox } from "lucide-react";

import InquiryCard from "../../components/customer/journey/InquiryCard";
import PaymentPlanCard from "../../components/customer/journey/PaymentPlanCard";

// ── Skeletons ─────────────────────────────────────────────────────────────────
const InquiryCardSkeleton = () => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 animate-pulse">
    <div className="flex gap-4">
      <div className="w-28 h-24 rounded-xl bg-gray-200 flex-shrink-0" />
      <div className="flex-1 space-y-3">
        <div className="h-4 w-48 bg-gray-200 rounded" />
        <div className="h-3 w-32 bg-gray-100 rounded" />
        <div className="h-12 w-full bg-gray-100 rounded-xl" />
        <div className="h-7 w-full bg-gray-100 rounded-full" />
      </div>
    </div>
  </div>
);

const PaymentCardSkeleton = () => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-pulse">
    <div className="flex gap-4 p-5 border-b border-gray-50">
      <div className="w-20 h-16 rounded-xl bg-gray-200 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-40 bg-gray-200 rounded" />
        <div className="h-3 w-24 bg-gray-100 rounded" />
      </div>
    </div>
    <div className="px-5 pt-4 pb-5 space-y-2">
      <div className="h-3 w-full bg-gray-100 rounded-full" />
      <div className="h-3 w-3/4 bg-gray-100 rounded-full" />
    </div>
  </div>
);

// ── Empty state ───────────────────────────────────────────────────────────────
const EmptyState = ({ icon: Icon, message }) => (
  <div className="flex flex-col items-center justify-center py-14 text-center text-gray-400">
    <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
      <Icon size={24} className="opacity-50" />
    </div>
    <p className="text-sm font-medium">{message}</p>
  </div>
);

// ── Section heading ───────────────────────────────────────────────────────────
const SectionHeading = ({ icon: Icon, title, count }) => (
  <div className="flex items-center gap-3 mb-5">
    <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
      <Icon size={18} className="text-brand-600" />
    </div>
    <div>
      <h2 className="text-lg font-extrabold text-gray-900 leading-none">{title}</h2>
      {count !== undefined && (
        <p className="text-xs text-gray-400 mt-0.5">{count} record{count !== 1 ? "s" : ""}</p>
      )}
    </div>
  </div>
);

// ── Main Page ─────────────────────────────────────────────────────────────────
const JourneyPage = () => {
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");
  const [inquiries, setInquiries] = useState([]);
  const [payments,  setPayments]  = useState([]);

  useEffect(() => {
    const fetchJourney = async () => {
      try {
        const { data } = await axios.get("/api/customer/journey", {
          withCredentials: true,
        });
        if (data.success) {
          setInquiries(data.data.inquiries ?? []);
          setPayments(data.data.payments ?? []);
        }
      } catch (err) {
        const msg = err?.response?.data?.message || "Failed to load your journey.";
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchJourney();
  }, []);

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">

      {/* ── Page Header ──────────────────────────────────────────────── */}
      <div className="mb-10">
        <p className="text-xs font-bold uppercase tracking-widest text-brand-500 mb-1">
          Customer Panel
        </p>
        <h1 className="text-3xl font-extrabold text-gray-900">My Journey</h1>
        <p className="text-gray-500 text-sm mt-1.5">
          Track your property inquiries and manage your payment schedules.
        </p>
      </div>

      {/* ── Error Banner ─────────────────────────────────────────────── */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          SECTION 1 — My Inquiries (Pipeline)
      ══════════════════════════════════════════════════════════════ */}
      <section className="mb-12">
        <SectionHeading
          icon={ClipboardList}
          title="My Inquiries (Pipeline)"
          count={loading ? undefined : inquiries.length}
        />

        <div className="space-y-4">
          {loading ? (
            <>
              <InquiryCardSkeleton />
              <InquiryCardSkeleton />
            </>
          ) : inquiries.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
              <EmptyState
                icon={Inbox}
                message="You have no active inquiries yet. Start by requesting a property price."
              />
            </div>
          ) : (
            inquiries.map((inquiry) => (
              <InquiryCard key={inquiry._id} inquiry={inquiry} />
            ))
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 2 — My Payment Plans
      ══════════════════════════════════════════════════════════════ */}
      <section>
        <SectionHeading
          icon={CreditCard}
          title="My Payment Plans"
          count={loading ? undefined : payments.length}
        />

        <div className="space-y-4">
          {loading ? (
            <>
              <PaymentCardSkeleton />
              <PaymentCardSkeleton />
            </>
          ) : payments.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
              <EmptyState
                icon={CreditCard}
                message="No payment plans yet. Once a deal is closed, your installment schedule will appear here."
              />
            </div>
          ) : (
            payments.map((plan) => (
              <PaymentPlanCard key={plan._id} plan={plan} />
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default JourneyPage;
