import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import TopBar from "./components/common/TopBar";
import Navbar from "./components/common/Navbar";
import Home from "./pages/public/Home";
import Login from "./pages/public/Login";
import Register from "./pages/public/Register";
import FilteredProperties from "./pages/public/FilteredProperties";

// Admin Panel
import AdminLayout from "./pages/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import BannerManagement from "./pages/admin/BannerManagement";
import AddBuilding from "./pages/admin/AddBuilding";
import ManageBuildings from "./pages/admin/ManageBuildings";
import EditBuilding from "./pages/admin/EditBuilding";
import UserManagement from "./pages/admin/UserManagement";
import SystemHierarchyView from "./pages/admin/SystemHierarchyView";
import SellersPerformance from "./pages/admin/SellersPerformance";
import AdminPendingLeads from "./pages/admin/AdminPendingLeads";
import MasterAnalytics from "./pages/admin/MasterAnalytics";
import AdminBookUnit from "./pages/admin/AdminBookUnit";
import BookUnitDetail from "./pages/admin/BookUnitDetail";
import AreaManagement from "./pages/admin/AreaManagement";

import MembershipManagement from "./pages/admin/MembershipManagement";
import MemberPaymentDetail from "./pages/admin/MemberPaymentDetail";
import ProjectsManagement from "./pages/admin/ProjectsManagement";
import PaymentTracking from "./pages/admin/PaymentTracking";
import Analysis from "./pages/admin/Analysis";

// Seller Panel
import SellerLayout from "./pages/seller/SellerLayout";
import SellerDashboard from "./pages/seller/SellerDashboard";
import AssignedLeads from "./pages/seller/AssignedLeads";
import MyTeam from "./pages/seller/MyTeam";
import SellerProfile from "./pages/seller/SellerProfile";
import SellerBookUnit from "./pages/seller/SellerBookUnit";
import MySales from "./pages/seller/MySales";

import CustomerProfile from "./pages/public/CustomerProfile";
import PropertyDetails from "./pages/public/PropertyDetails";

// Customer Panel
import CustomerLayout from "./pages/customer/CustomerLayout";
import CustomerDashboard from "./pages/customer/CustomerDashboard";
import JourneyPage from "./pages/customer/JourneyPage";
import CustomerProfilePage from "./pages/customer/CustomerProfilePage";
import DocumentVaultPage from "./pages/customer/DocumentVaultPage";

import ProtectedRoute from "./components/common/ProtectedRoute";

import DirectorLayout from "./layouts/DirectorLayout";
import DirectorDashboard from "./pages/director/DirectorDashboard";
import GMLayout from "./layouts/GMLayout";
import GMDashboard from "./pages/gm/GMDashboard";
import AGMLayout from "./layouts/AGMLayout";
import AGMDashboard from "./pages/agm/AGMDashboard";
import AreaManagerLayout from "./layouts/AreaManagerLayout";
import AreaManagerDashboard from "./pages/area_manager/AreaManagerDashboard";
import AccountantLayout from "./layouts/AccountantLayout";
import AccountantDashboard from "./pages/accountant/AccountantDashboard";
import PendingConfirmations from "./pages/accountant/PendingConfirmations";
import AccountantMembers from "./pages/accountant/AccountantMembers";
import DataEntryLayout from "./layouts/DataEntryLayout";
import DataEntryDashboard from "./pages/dataentry/DataEntryDashboard";
import DataEntryPending from "./pages/dataentry/DataEntryPending";
import DataEntryMembers from "./pages/dataentry/DataEntryMembers";
import ManagementLayout from "./layouts/ManagementLayout";
import ManagementDashboard from "./pages/management/ManagementDashboard";
import ManagementPending from "./pages/management/ManagementPending";
import ManagementMembers from "./pages/management/ManagementMembers";
import BuildingAllocate from "./pages/management/BuildingAllocate";
import MemberLayout from "./layouts/MemberLayout";
import MemberDashboard from "./pages/member/MemberDashboard";
import InvestorLayout from "./layouts/InvestorLayout";
import InvestorDashboard from "./pages/investor/InvestorDashboard";
import InvestorProperties from "./pages/investor/InvestorProperties";
import MembershipJourney from "./pages/membership/MembershipJourney";
import PaymentPage from "./pages/membership/PaymentPage";

const Placeholder = ({ title }) => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="text-center">
      <h2 className="text-3xl font-bold text-brand-700 mb-2">{title}</h2>
      <p className="text-gray-500">This panel is coming soon.</p>
    </div>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: { borderRadius: "10px", fontSize: "14px" },
        }}
      />
      <AuthProvider>
        <div className="min-h-screen" style={{ background: "#FAF7F0" }}>
          <TopBar />
          <Navbar />

          <main>

            <Routes>
              {/* Public routes */}
              <Route path="/"         element={<Home />} />
              <Route path="/login"    element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/properties/filtered" element={<FilteredProperties />} />

              {/* Admin Panel */}
              <Route path="/admin-panel" element={<AdminLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="pending-leads" element={<AdminPendingLeads />} />
                <Route path="sellers-performance" element={<SellersPerformance />} />
                <Route path="master-analytics" element={<MasterAnalytics />} />
                <Route path="banners" element={<BannerManagement />} />
                <Route path="buildings" element={<AddBuilding />} />
                <Route path="manage-buildings" element={<ManageBuildings />} />
                <Route path="edit-building/:id" element={<EditBuilding />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="hierarchy" element={<SystemHierarchyView />} />
                <Route path="book-unit" element={<AdminBookUnit />} />
                <Route path="book-unit/:id" element={<BookUnitDetail />} />
                <Route path="areas" element={<AreaManagement />} />

                <Route path="memberships" element={<MembershipManagement />} />
                <Route path="memberships/:membershipId" element={<MemberPaymentDetail />} />
                <Route path="payment-tracking" element={<PaymentTracking />} />
                <Route path="analysis" element={<Analysis />} />
                <Route path="projects" element={<ProjectsManagement />} />
              </Route>

              {/* Seller Panel */}
              <Route path="/seller-panel" element={<SellerLayout />}>
                <Route index element={<SellerDashboard />} />
                <Route path="assigned" element={<AssignedLeads />} />
                <Route path="my-team" element={<MyTeam />} />
                <Route path="profile" element={<SellerProfile />} />
                <Route path="book-unit" element={<SellerBookUnit />} />
                <Route path="book-unit/:id" element={<BookUnitDetail />} />
                <Route path="my-sales" element={<MySales />} />
              </Route>

              {/* Other routes */}
              <Route path="/property/:id" element={<PropertyDetails />} />
              <Route path="/profile" element={<CustomerProfile />} />
              {/* Customer Panel */}
              <Route path="/customer-panel" element={<CustomerLayout />}>
                <Route index element={<CustomerDashboard />} />
                <Route path="requests" element={<JourneyPage />} />
                <Route path="profile"  element={<CustomerProfilePage />} />
                <Route path="vault"    element={<DocumentVaultPage />} />
              </Route>
              
              <Route path="/director" element={<ProtectedRoute allowedRoles={['Director']}><DirectorLayout /></ProtectedRoute>}>
                <Route index element={<DirectorDashboard />} />
              </Route>

              <Route path="/gm" element={<ProtectedRoute allowedRoles={['GM']}><GMLayout /></ProtectedRoute>}>
                <Route index element={<GMDashboard />} />
              </Route>

              <Route path="/agm" element={<ProtectedRoute allowedRoles={['AGM']}><AGMLayout /></ProtectedRoute>}>
                <Route index element={<AGMDashboard />} />
              </Route>

              <Route path="/area-manager" element={<ProtectedRoute allowedRoles={['area_manager']}><AreaManagerLayout /></ProtectedRoute>}>
                <Route index element={<AreaManagerDashboard />} />
              </Route>

              <Route path="/accountant" element={<ProtectedRoute allowedRoles={['Accountant']}><AccountantLayout /></ProtectedRoute>}>
                <Route index element={<AccountantDashboard />} />
                <Route path="pending" element={<PendingConfirmations />} />
                <Route path="members" element={<AccountantMembers />} />
              </Route>

              <Route path="/data-entry" element={<ProtectedRoute allowedRoles={['DataEntry']}><DataEntryLayout /></ProtectedRoute>}>
                <Route index element={<DataEntryDashboard />} />
                <Route path="pending" element={<DataEntryPending />} />
                <Route path="members" element={<DataEntryMembers />} />
              </Route>

              <Route path="/management" element={<ProtectedRoute allowedRoles={['Management']}><ManagementLayout /></ProtectedRoute>}>
                <Route index element={<ManagementDashboard />} />
                <Route path="pending" element={<ManagementPending />} />
                <Route path="members" element={<ManagementMembers />} />
                <Route path="allocate" element={<BuildingAllocate />} />
                <Route path="analysis" element={<Analysis />} />
              </Route>

              {/* Universal investment-journey entry — any logged-in user */}
              <Route path="/membership" element={<ProtectedRoute><MembershipJourney /></ProtectedRoute>} />
              <Route path="/membership/pay" element={<ProtectedRoute><PaymentPage /></ProtectedRoute>} />

              <Route path="/member" element={<ProtectedRoute allowedRoles={['member']}><MemberLayout /></ProtectedRoute>}>
                <Route index element={<MemberDashboard />} />
              </Route>

              <Route path="/investor" element={<ProtectedRoute allowedRoles={['Investor']}><InvestorLayout /></ProtectedRoute>}>
                <Route index element={<InvestorDashboard />} />
                <Route path="properties" element={<InvestorProperties />} />
              </Route>
              <Route path="/properties"     element={<Placeholder title="Properties" />} />
              <Route path="/about"          element={<Placeholder title="About Us" />} />
              <Route path="/contact"        element={<Placeholder title="Contact Us" />} />
              <Route path="*" element={<Placeholder title="404 — Page Not Found" />} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
