import React from "react";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "../components/common/ProtectedRoute";

import DirectorLayout from "../layouts/DirectorLayout";
import DirectorDashboard from "../pages/director/DirectorDashboard";
import GMLayout from "../layouts/GMLayout";
import GMDashboard from "../pages/gm/GMDashboard";
import AGMLayout from "../layouts/AGMLayout";
import AGMDashboard from "../pages/agm/AGMDashboard";
import AccountantLayout from "../layouts/AccountantLayout";
import AccountantDashboard from "../pages/accountant/AccountantDashboard";
import PendingConfirmations from "../pages/accountant/PendingConfirmations";
import AccountantMembers from "../pages/accountant/AccountantMembers";
import DataEntryLayout from "../layouts/DataEntryLayout";
import DataEntryDashboard from "../pages/dataentry/DataEntryDashboard";
import DataEntryPending from "../pages/dataentry/DataEntryPending";
import DataEntryMembers from "../pages/dataentry/DataEntryMembers";
import ManagementLayout from "../layouts/ManagementLayout";
import ManagementDashboard from "../pages/management/ManagementDashboard";
import ManagementPending from "../pages/management/ManagementPending";
import ManagementMembers from "../pages/management/ManagementMembers";
import BuildingAllocate from "../pages/management/BuildingAllocate";
import Analysis from "../pages/admin/Analysis";

const StaffRoutes = () => (
  <Routes>
    <Route path="/director/*" element={<ProtectedRoute allowedRoles={['Director']}><DirectorLayout /></ProtectedRoute>}>
      <Route index element={<DirectorDashboard />} />
    </Route>

    <Route path="/gm/*" element={<ProtectedRoute allowedRoles={['GM']}><GMLayout /></ProtectedRoute>}>
      <Route index element={<GMDashboard />} />
    </Route>

    <Route path="/agm/*" element={<ProtectedRoute allowedRoles={['AGM']}><AGMLayout /></ProtectedRoute>}>
      <Route index element={<AGMDashboard />} />
    </Route>

    <Route path="/accountant/*" element={<ProtectedRoute allowedRoles={['Accountant']}><AccountantLayout /></ProtectedRoute>}>
      <Route index element={<AccountantDashboard />} />
      <Route path="pending" element={<PendingConfirmations />} />
      <Route path="members" element={<AccountantMembers />} />
    </Route>

    <Route path="/data-entry/*" element={<ProtectedRoute allowedRoles={['DataEntry']}><DataEntryLayout /></ProtectedRoute>}>
      <Route index element={<DataEntryDashboard />} />
      <Route path="pending" element={<DataEntryPending />} />
      <Route path="members" element={<DataEntryMembers />} />
    </Route>

    <Route path="/management/*" element={<ProtectedRoute allowedRoles={['Management']}><ManagementLayout /></ProtectedRoute>}>
      <Route index element={<ManagementDashboard />} />
      <Route path="pending" element={<ManagementPending />} />
      <Route path="members" element={<ManagementMembers />} />
      <Route path="allocate" element={<BuildingAllocate />} />
      <Route path="analysis" element={<Analysis />} />
    </Route>
  </Routes>
);

export default StaffRoutes;
