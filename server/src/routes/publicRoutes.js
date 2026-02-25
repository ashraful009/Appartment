const express = require("express");
const router  = express.Router();

const { getBanners, getActiveBanner } = require("../controllers/bannerController");
const { getProperties, getPropertyById } = require("../controllers/propertyController");

// ── Public banner routes ────────────────────────────────────────────────────
// GET /api/banners/active  — most recent active banner (for hero carousel)
router.get("/banners/active", getActiveBanner);

// GET /api/banners          — all active banners
router.get("/banners", getBanners);

// ── Public property routes ──────────────────────────────────────────────────
// GET /api/properties       — all properties
router.get("/properties", getProperties);

// GET /api/properties/:id   — single property by ID
router.get("/properties/:id", getPropertyById);

module.exports = router;

