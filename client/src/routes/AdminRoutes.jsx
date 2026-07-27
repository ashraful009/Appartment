import React from "react";
import { Routes, Route } from "react-router-dom";

import AdminLayout from "../pages/admin/AdminLayout";
import Dashboard from "../pages/admin/Dashboard";
import BannerManagement from "../pages/admin/BannerManagement";
import AddBuilding from "../pages/admin/AddBuilding";
import ManageBuildings from "../pages/admin/ManageBuildings";
import EditBuilding from "../pages/admin/EditBuilding";
import UserManagement from "../pages/admin/UserManagement";
import SellersPerformance from "../pages/admin/SellersPerformance";
import AdminPendingLeads from "../pages/admin/AdminPendingLeads";
import MasterAnalytics from "../pages/admin/MasterAnalytics";
import AdminBookUnit from "../pages/admin/AdminBookUnit";
import BookUnitDetail from "../pages/admin/BookUnitDetail";
import AreaManagement from "../pages/admin/AreaManagement";
import MembershipManagement from "../pages/admin/MembershipManagement";
import MemberPaymentDetail from "../pages/admin/MemberPaymentDetail";
import ProjectsManagement from "../pages/admin/ProjectsManagement";
import PaymentTracking from "../pages/admin/PaymentTracking";
import Analysis from "../pages/admin/Analysis";

const AdminRoutes = () => (
  <Routes>
    <Route path="/" element={<AdminLayout />}>
      <Route index element={<Dashboard />} />
      <Route path="pending-leads" element={<AdminPendingLeads />} />
      <Route path="sellers-performance" element={<SellersPerformance />} />
      <Route path="master-analytics" element={<MasterAnalytics />} />
      <Route path="banners" element={<BannerManagement />} />
      <Route path="buildings" element={<AddBuilding />} />
      <Route path="manage-buildings" element={<ManageBuildings />} />
      <Route path="edit-building/:id" element={<EditBuilding />} />
      <Route path="users" element={<UserManagement />} />
      <Route path="book-unit" element={<AdminBookUnit />} />
      <Route path="book-unit/:id" element={<BookUnitDetail />} />
      <Route path="areas" element={<AreaManagement />} />
      <Route path="memberships" element={<MembershipManagement />} />
      <Route path="memberships/:membershipId" element={<MemberPaymentDetail />} />
      <Route path="payment-tracking" element={<PaymentTracking />} />
      <Route path="analysis" element={<Analysis />} />
      <Route path="projects" element={<ProjectsManagement />} />
    </Route>
  </Routes>
);

export default AdminRoutes;
