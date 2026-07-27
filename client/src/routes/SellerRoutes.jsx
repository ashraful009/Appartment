import React from "react";
import { Routes, Route } from "react-router-dom";

import SellerLayout from "../pages/seller/SellerLayout";
import SellerDashboard from "../pages/seller/SellerDashboard";
import AssignedLeads from "../pages/seller/AssignedLeads";
import MyTeam from "../pages/seller/MyTeam";
import SellerProfile from "../pages/seller/SellerProfile";
import SellerBookUnit from "../pages/seller/SellerBookUnit";
import BookUnitDetail from "../pages/admin/BookUnitDetail";
import MySales from "../pages/seller/MySales";

const SellerRoutes = () => (
  <Routes>
    <Route path="/" element={<SellerLayout />}>
      <Route index element={<SellerDashboard />} />
      <Route path="assigned" element={<AssignedLeads />} />
      <Route path="my-team" element={<MyTeam />} />
      <Route path="profile" element={<SellerProfile />} />
      <Route path="book-unit" element={<SellerBookUnit />} />
      <Route path="book-unit/:id" element={<BookUnitDetail />} />
      <Route path="my-sales" element={<MySales />} />
    </Route>
  </Routes>
);

export default SellerRoutes;
