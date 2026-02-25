const express = require("express");
const router  = express.Router();

const { protect }        = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/authMiddleware");
const { uploadBannerImages, uploadPropertyImages } = require("../middleware/uploadMiddleware");

const { getStats, getUsers, updateUserRoles } = require("../controllers/adminController");
const { createBanner, getBanners }            = require("../controllers/bannerController");
const { createProperty, getProperties }       = require("../controllers/propertyController");

// All routes below require a valid JWT + admin role
const adminGuard = [protect, authorizeRoles("admin")];

// ─── Admin Stats ───────────────────────────────────────────────────────────
// GET /api/admin/stats
router.get("/stats", adminGuard, getStats);

// ─── User Management ──────────────────────────────────────────────────────
// GET /api/admin/users
router.get("/users", adminGuard, getUsers);

// PUT /api/admin/users/:id/roles
router.put("/users/:id/roles", adminGuard, updateUserRoles);

// ─── Banners ──────────────────────────────────────────────────────────────
// POST /api/admin/banners   (admin only, uploads to Cloudinary)
router.post("/banners", adminGuard, uploadBannerImages, createBanner);

// GET /api/admin/banners    (also aliased publicly — see index.js)
router.get("/banners", getBanners);

// ─── Properties / Buildings ───────────────────────────────────────────────
// POST /api/admin/properties
router.post("/properties", adminGuard, uploadPropertyImages, createProperty);

// GET /api/admin/properties
router.get("/properties", getProperties);

module.exports = router;
