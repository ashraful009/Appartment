const express = require("express");
const router  = express.Router();

const { getPublicBanners, getActiveBanner } = require("../controllers/bannerController");
const { getPublicProperties, getPropertyById, getPropertyUnits } = require("../controllers/propertyController");
const { optionalAuth } = require("../middleware/authMiddleware");

// ── Public banner routes ────────────────────────────────────────────────────
// NOTE: /banners/active MUST be registered BEFORE /banners to avoid /:id clash
// GET /api/banners/active  — most recent active banner (for hero carousel)
router.get("/banners/active", getActiveBanner);

// GET /api/banners          — all active banners (isActive: true)
router.get("/banners", getPublicBanners);

// ── Public property routes ──────────────────────────────────────────────────
// GET /api/properties/public?page=1&limit=6  — paginated public listing
// NOTE: all static sub-paths MUST be registered BEFORE /properties/:id
router.get("/properties/public", getPublicProperties);

// GET /api/properties        — legacy alias (same paginated handler)
router.get("/properties", getPublicProperties);

// GET /api/properties/:id   — single property by ID
router.get("/properties/:id", getPropertyById);

// GET /api/properties/:id/units — units for a single property
router.get("/properties/:id/units", optionalAuth, getPropertyUnits);

module.exports = router;
