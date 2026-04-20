import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import TopBar from "./components/common/TopBar";
import Navbar from "./components/common/Navbar";
import Home from "./pages/public/Home";
import Login from "./pages/public/Login";
import Register from "./pages/public/Register";
import ToastPopup from "./components/common/ToastPopup";
// Admin Panel
import AdminLayout from "./pages/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import BannerManagement from "./pages/admin/BannerManagement";
import AddBuilding from "./pages/admin/AddBuilding";
import ManageBuildings from "./pages/admin/ManageBuildings";
import EditBuilding from "./pages/admin/EditBuilding";
import UserManagement from "./pages/admin/UserManagement";
import SellersPerformance from "./pages/admin/SellersPerformance";
import AdminPendingLeads from "./pages/admin/AdminPendingLeads";
import MasterAnalytics from "./pages/admin/MasterAnalytics";
import AdminBookUnit from "./pages/admin/AdminBookUnit";
import BookUnitDetail from "./pages/admin/BookUnitDetail";

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
import MyAppartment from "./pages/customer/MyAppartment";

import ProtectedRoute from "./components/common/ProtectedRoute";

import DirectorLayout from "./layouts/DirectorLayout";
import DirectorDashboard from "./pages/director/DirectorDashboard";
import GMLayout from "./layouts/GMLayout";
import GMDashboard from "./pages/gm/GMDashboard";
import AGMLayout from "./layouts/AGMLayout";
import AGMDashboard from "./pages/agm/AGMDashboard";
import AccountantLayout from "./layouts/AccountantLayout";
import AccountantDashboard from "./pages/accountant/AccountantDashboard";
import SoldUnits from "./pages/accountant/SoldUnits";
import CustomerPayments from "./pages/accountant/CustomerPayments";

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
            <ToastPopup />
            <Routes>
              {/* Public routes */}
              <Route path="/"         element={<Home />} />
              <Route path="/login"    element={<Login />} />
              <Route path="/register" element={<Register />} />

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
                <Route path="book-unit" element={<AdminBookUnit />} />
                <Route path="book-unit/:id" element={<BookUnitDetail />} />
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
                <Route path="my-apartment" element={<MyAppartment />} />
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

              <Route path="/accountant" element={<ProtectedRoute allowedRoles={['Accountant']}><AccountantLayout /></ProtectedRoute>}>
                <Route index element={<AccountantDashboard />} />
                <Route path="sold-units" element={<SoldUnits />} />
                <Route path="payments" element={<CustomerPayments />} />
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
