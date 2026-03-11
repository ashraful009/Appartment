import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import TopBar from "./components/common/TopBar";
import Navbar from "./components/common/Navbar";
import Home from "./pages/public/Home";
import Login from "./pages/public/Login";
import Register from "./pages/public/Register";

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

// Seller Panel
import SellerLayout from "./pages/seller/SellerLayout";
import SellerDashboard from "./pages/seller/SellerDashboard";
import AssignedLeads from "./pages/seller/AssignedLeads";
import MyTeam from "./pages/seller/MyTeam";
import SellerProfile from "./pages/seller/SellerProfile";

import CustomerProfile from "./pages/public/CustomerProfile";
import PropertyDetails from "./pages/public/PropertyDetails";

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
        <div className="min-h-screen bg-gray-50">
          <TopBar />
          <Navbar />

          <main>
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
              </Route>

              {/* Seller Panel */}
              <Route path="/seller-panel" element={<SellerLayout />}>
                <Route index element={<SellerDashboard />} />
                <Route path="assigned" element={<AssignedLeads />} />
                <Route path="my-team" element={<MyTeam />} />
                <Route path="profile" element={<SellerProfile />} />
              </Route>

              {/* Other routes */}
              <Route path="/property/:id" element={<PropertyDetails />} />
              <Route path="/profile" element={<CustomerProfile />} />
              <Route path="/customer-panel" element={<Placeholder title="Customer Panel" />} />
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
