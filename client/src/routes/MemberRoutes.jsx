import React from "react";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "../components/common/ProtectedRoute";

import MemberLayout from "../layouts/MemberLayout";
import MemberDashboard from "../pages/member/MemberDashboard";
import InvestorLayout from "../layouts/InvestorLayout";
import InvestorDashboard from "../pages/investor/InvestorDashboard";
import InvestorProperties from "../pages/investor/InvestorProperties";

const MemberRoutes = () => (
  <Routes>
    <Route path="/member/*" element={<ProtectedRoute allowedRoles={['member']}><MemberLayout /></ProtectedRoute>}>
      <Route index element={<MemberDashboard />} />
    </Route>

    <Route path="/investor/*" element={<ProtectedRoute allowedRoles={['Investor']}><InvestorLayout /></ProtectedRoute>}>
      <Route index element={<InvestorDashboard />} />
      <Route path="properties" element={<InvestorProperties />} />
    </Route>
  </Routes>
);

export default MemberRoutes;
