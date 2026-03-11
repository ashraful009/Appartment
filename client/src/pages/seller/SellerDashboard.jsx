import React from "react";
import { useAuth } from "../../context/AuthContext";
import TargetProgressBar from "../../components/seller/dashboard/TargetProgressBar";

// ── Main ──────────────────────────────────────────────────────────────────────
const SellerDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="p-8">
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Seller Panel</p>
        <h1 className="text-3xl font-extrabold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          Welcome back, {user?.name}! Use your referral code in the sidebar to grow your leads.
        </p>
      </div>

      {/* Target Progress */}
      <TargetProgressBar />
    </div>
  );
};

export default SellerDashboard;
