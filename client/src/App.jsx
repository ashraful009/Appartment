import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import TopBar from "./components/TopBar";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

// Admin Panel
import AdminLayout from "./pages/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import BannerManagement from "./pages/admin/BannerManagement";
import AddBuilding from "./pages/admin/AddBuilding";
import UserManagement from "./pages/admin/UserManagement";
import SellersPerformance from "./pages/admin/SellersPerformance";
import AdminPendingLeads from "./pages/admin/AdminPendingLeads";
import SellersAnalytics from "./pages/admin/SellersAnalytics";

// Seller Panel
import SellerLayout from "./pages/seller/SellerLayout";
import SellerDashboard from "./pages/seller/SellerDashboard";
import AssignedLeads from "./pages/seller/AssignedLeads";
import MyTeam from "./pages/seller/MyTeam";

import PropertyDetails from "./pages/PropertyDetails";

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
                <Route path="sellers-analytics" element={<SellersAnalytics />} />
                <Route path="banners" element={<BannerManagement />} />
                <Route path="buildings" element={<AddBuilding />} />
                <Route path="users" element={<UserManagement />} />
              </Route>

              {/* Seller Panel */}
              <Route path="/seller-panel" element={<SellerLayout />}>
                <Route index element={<SellerDashboard />} />
                <Route path="assigned" element={<AssignedLeads />} />
                <Route path="my-team" element={<MyTeam />} />
              </Route>

              {/* Other routes */}
              <Route path="/property/:id" element={<PropertyDetails />} />
              <Route path="/profile" element={<Placeholder title="My Profile" />} />
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
