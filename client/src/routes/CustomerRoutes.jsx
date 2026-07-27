import React from "react";
import { Routes, Route } from "react-router-dom";

import CustomerLayout from "../pages/customer/CustomerLayout";
import CustomerDashboard from "../pages/customer/CustomerDashboard";
import JourneyPage from "../pages/customer/JourneyPage";
import CustomerProfilePage from "../pages/customer/CustomerProfilePage";
import DocumentVaultPage from "../pages/customer/DocumentVaultPage";

const CustomerRoutes = () => (
  <Routes>
    <Route path="/" element={<CustomerLayout />}>
      <Route index element={<CustomerDashboard />} />
      <Route path="requests" element={<JourneyPage />} />
      <Route path="profile" element={<CustomerProfilePage />} />
      <Route path="vault" element={<DocumentVaultPage />} />
    </Route>
  </Routes>
);

export default CustomerRoutes;
