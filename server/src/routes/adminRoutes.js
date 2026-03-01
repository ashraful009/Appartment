const express = require("express");
const router  = express.Router();

const { protect }        = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/authMiddleware");
const { uploadBannerImages, uploadPropertyImages } = require("../middleware/uploadMiddleware");

const {
    getStats,
    getUsers,
    updateUserRoles,
    getAdminPendingRequests,
    getSellersList,
    assignRequest,
    getSellersPerformance,
    getConversionStats,
    approveConversion,
    rejectConversion,
    rejectSellerConversion,
    getSellerAnalytics,
    approveSellerConversion,
} = require("../controllers/adminController");
const { createBanner, getBanners } = require("../controllers/bannerController");
const { createProperty, getProperties } = require("../controllers/propertyController");

// All routes below require a valid JWT + admin role
const adminGuard = [protect, authorizeRoles("admin")];

// ─── Admin Stats ───────────────────────────────────────────────────────────
router.get("/stats", adminGuard, getStats);

// ─── User Management ──────────────────────────────────────────────────────
router.get("/users", adminGuard, getUsers);
router.put("/users/:id/roles", adminGuard, updateUserRoles);

// ─── Banners ──────────────────────────────────────────────────────────────
router.post("/banners", adminGuard, uploadBannerImages, createBanner);
router.get("/banners", getBanners);

// ─── Properties / Buildings ───────────────────────────────────────────────
router.post("/properties", adminGuard, uploadPropertyImages, createProperty);
router.get("/properties", getProperties);

// ─── Lead Assignment Workflow ─────────────────────────────────────────────
// GET /api/admin/requests/pending   — all unassigned leads for admin to review
router.get("/requests/pending", adminGuard, getAdminPendingRequests);

// GET /api/admin/sellers-list       — sellers with their current active lead count
router.get("/sellers-list", adminGuard, getSellersList);

// PUT /api/admin/requests/:id/assign — admin assigns a lead to a chosen seller
router.put("/requests/:id/assign", adminGuard, assignRequest);

// ─── Conversion Workflow ──────────────────────────────────────────────────
router.get("/sellers-performance", adminGuard, getSellersPerformance);
router.get("/conversion-stats", adminGuard, getConversionStats);
router.put("/requests/:id/approve-conversion", adminGuard, approveConversion);
router.put("/requests/:id/reject-conversion", adminGuard, rejectConversion);

// ─── Seller Analytics ───────────────────────────────────────────────────
// GET /api/admin/seller-analytics   — 3-dataset analytics for dashboard
router.get("/seller-analytics", adminGuard, getSellerAnalytics);

// PUT /api/admin/requests/:id/approve-seller-conversion
router.put("/requests/:id/approve-seller-conversion", adminGuard, approveSellerConversion);

// PUT /api/admin/requests/:id/reject-seller-conversion
router.put("/requests/:id/reject-seller-conversion", adminGuard, rejectSellerConversion);

module.exports = router;
