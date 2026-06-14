import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { Clock } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import InvestmentStatusPanel from "./InvestmentStatusPanel";
import BookingCTA from "./BookingCTA";
import DownPaymentCTA from "./DownPaymentCTA";
import InstallmentList from "./InstallmentList";
import AllocatedUnitCard from "./AllocatedUnitCard";
import ProjectsSection from "./ProjectsSection";

/**
 * The universal investment-journey screen. Fetches the caller's membership and
 * renders the appropriate sections for their stage:
 *   none            → BookingCTA
 *   pending_booking → awaiting-approval notice
 *   member          → status + DownPaymentCTA
 *   investor        → status + InstallmentList
 *   lapsed          → lapsed notice (can re-book)
 * Projects are always shown at the bottom (for members/investors).
 */
const InvestmentPanel = ({ title = "Investment Dashboard" }) => {
  const { refreshUser } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/membership/me", { withCredentials: true });
      setData(data);
    } catch {
      setData({ membership: null, ledger: [], summary: null });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // After a state-changing action, reload membership AND refresh roles so any
  // newly-unlocked panel/navbar link appears.
  const reload = useCallback(async () => {
    await load();
    await refreshUser();
  }, [load, refreshUser]);

  if (loading) {
    return (
      <div className="p-8 space-y-4">
        <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const { membership, ledger = [], summary, allocatedUnit } = data || {};
  const status = membership?.status;
  const installments = ledger.filter((e) => e.type === "installment");
  const IN_PROGRESS = ["Pending", "AccountantConfirmed", "DataEntryConfirmed"];
  const downpaymentPending = ledger.some(
    (e) => e.type === "downpayment" && IN_PROGRESS.includes(e.status)
  );

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">{title}</h1>
        <p className="text-gray-500 text-sm mt-1">
          Your membership & investment journey.
        </p>
      </div>

      {/* No membership → booking entry */}
      {!membership && <BookingCTA onSubmitted={reload} />}

      {/* Booking submitted, awaiting approval */}
      {status === "pending_booking" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
          <Clock size={28} className="text-amber-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-gray-800">Booking under review</h2>
          <p className="text-gray-500 text-sm mt-1">
            Your booking money is submitted. You'll become a member once an admin
            approves it.
          </p>
        </div>
      )}

      {/* Lapsed */}
      {status === "lapsed" && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-6 text-center">
          <h2 className="text-lg font-bold">Membership lapsed</h2>
          <p className="text-sm mt-1">
            The 6-month window to complete your down payment expired, so your membership
            was revoked.
          </p>
        </div>
      )}

      {/* Active stages → status panel */}
      {(status === "member" || status === "investor") && (
        <InvestmentStatusPanel membership={membership} summary={summary} />
      )}

      {/* Member → down payment CTA */}
      {status === "member" && (
        <DownPaymentCTA
          membership={membership}
          pending={downpaymentPending}
          onSubmitted={reload}
        />
      )}

      {/* Investor → allocated unit (if Management has allocated one) */}
      {status === "investor" && allocatedUnit && (
        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-3">My Property</h2>
          <AllocatedUnitCard unit={allocatedUnit} />
        </div>
      )}

      {/* Investor → installments */}
      {status === "investor" && (
        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-3">Installments</h2>
          <InstallmentList installments={installments} onPaid={reload} />
        </div>
      )}

      {/* Projects (always visible to members/investors) */}
      {(status === "member" || status === "investor") && (
        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-3">Projects</h2>
          <ProjectsSection />
        </div>
      )}
    </div>
  );
};

export default InvestmentPanel;
