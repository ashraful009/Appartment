const Banner = require("../models/Banner");

// ─────────────────────────────────────────────
// @desc   Create a new banner
// @route  POST /api/banners
// @access Private (admin)
// ─────────────────────────────────────────────
const createBanner = async (req, res) => {
  try {
    const { motivationalText, contactInfo } = req.body;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "At least one image is required." });
    }

    // req.files is an array from multer .array()
    const images          = req.files.map((f) => f.path);     // Cloudinary secure_url
    const imagePublicIds  = req.files.map((f) => f.filename);  // Cloudinary public_id

    const banner = await Banner.create({
      images,
      imagePublicIds,
      motivationalText: motivationalText || "",
      contactInfo:      contactInfo      || "",
    });

    res.status(201).json({ message: "Banner created successfully.", banner });
  } catch (error) {
    console.error("createBanner error:", error);
    res.status(500).json({ message: "Failed to create banner." });
  }
};

// ─────────────────────────────────────────────
// @desc   Get all banners (latest first)
// @route  GET /api/banners
// @access Public
// ─────────────────────────────────────────────
const getBanners = async (req, res) => {
  try {
    const banners = await Banner.find({ isActive: true }).sort({ createdAt: -1 });
    res.status(200).json({ banners });
  } catch (error) {
    console.error("getBanners error:", error);
    res.status(500).json({ message: "Failed to fetch banners." });
  }
};

// ─────────────────────────────────────────────
// @desc   Get the single most-recent active banner (for HomePage hero)
// @route  GET /api/banners/active
// @access Public
// ─────────────────────────────────────────────
const getActiveBanner = async (req, res) => {
  try {
    const banner = await Banner.findOne({ isActive: true }).sort({ createdAt: -1 });
    if (!banner) return res.status(404).json({ message: "No active banner found." });
    res.status(200).json({ banner });
  } catch (error) {
    console.error("getActiveBanner error:", error);
    res.status(500).json({ message: "Failed to fetch active banner." });
  }
};

module.exports = { createBanner, getBanners, getActiveBanner };
