const Banner = require("../models/Banner");
const cloudinary = require("../config/cloudinary");

// ─────────────────────────────────────────────────────────────────────────────
// Helper — safely delete a Cloudinary asset by public_id
// ─────────────────────────────────────────────────────────────────────────────
const destroyCloudinaryAsset = async (publicId, resourceType = "image") => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (err) {
    console.error("[Cloudinary] destroy failed:", publicId, err.message);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc   Get all banners (newest first) — admin view (no isActive filter)
// @route  GET /api/admin/banners
// @access Private (admin)
// ─────────────────────────────────────────────────────────────────────────────
const getBanners = async (req, res) => {
  try {
    const banners = await Banner.find().sort({ createdAt: -1 });
    res.status(200).json({ banners });
  } catch (error) {
    console.error("getBanners error:", error);
    res.status(500).json({ message: "Failed to fetch banners." });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc   Get all active banners — public listing
// @route  GET /api/banners
// @access Public
// ─────────────────────────────────────────────────────────────────────────────
const getPublicBanners = async (req, res) => {
  try {
    const banners = await Banner.find({ isActive: true }).sort({ createdAt: -1 });
    res.status(200).json({ banners });
  } catch (error) {
    console.error("getPublicBanners error:", error);
    res.status(500).json({ message: "Failed to fetch banners." });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc   Get a single banner by ID
// @route  GET /api/admin/banners/:id
// @access Private (admin)
// ─────────────────────────────────────────────────────────────────────────────
const getBannerById = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) return res.status(404).json({ message: "Banner not found." });
    res.status(200).json({ banner });
  } catch (error) {
    console.error("getBannerById error:", error);
    res.status(500).json({ message: "Failed to fetch banner." });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc   Get the single most-recent active banner (for HomePage hero)
// @route  GET /api/banners/active         (public route — defined in publicRoutes)
// @access Public
// ─────────────────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────
// @desc   Create a new banner
// @route  POST /api/admin/banners
// @access Private (admin)
//
// Expected multipart/form-data fields:
//   title         — optional string
//   mediaType     — 'image' | 'video'  (default: 'image')
//   isActive      — boolean string     (default: 'true')
//   desktopMedia  — file field for desktop asset
//   mobileMedia   — file field for mobile asset
// ─────────────────────────────────────────────────────────────────────────────
const createBanner = async (req, res) => {
  try {
    const { title = "", mediaType = "image", isActive } = req.body;

    const desktopFile = req.files?.desktopMedia?.[0];
    const mobileFile  = req.files?.mobileMedia?.[0];

    if (!desktopFile || !mobileFile) {
      return res.status(400).json({
        message: "Both desktopMedia and mobileMedia files are required.",
      });
    }

    const banner = await Banner.create({
      title,
      mediaType,
      desktopMediaUrl: desktopFile.path,      // Cloudinary secure_url
      desktopPublicId: desktopFile.filename,  // Cloudinary public_id
      mobileMediaUrl:  mobileFile.path,
      mobilePublicId:  mobileFile.filename,
      isActive: isActive === "false" ? false : true,
    });

    res.status(201).json({ message: "Banner created successfully.", banner });
  } catch (error) {
    console.error("createBanner error:", error);
    res.status(500).json({ message: "Failed to create banner." });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc   Update a banner (edit text fields and/or replace media)
// @route  PUT /api/admin/banners/:id
// @access Private (admin)
//
// All fields are optional — only supplied fields are updated.
// New files will replace the old Cloudinary assets.
// ─────────────────────────────────────────────────────────────────────────────
const updateBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) return res.status(404).json({ message: "Banner not found." });

    const { title, mediaType, isActive } = req.body;

    if (title    !== undefined) banner.title     = title;
    if (mediaType !== undefined) banner.mediaType = mediaType;
    if (isActive !== undefined) banner.isActive  = isActive === "false" ? false : Boolean(isActive);

    // ── Replace desktop asset if a new file was uploaded ─────────────────────
    const desktopFile = req.files?.desktopMedia?.[0];
    if (desktopFile) {
      const resourceType = (mediaType || banner.mediaType) === "video" ? "video" : "image";
      await destroyCloudinaryAsset(banner.desktopPublicId, resourceType);
      banner.desktopMediaUrl = desktopFile.path;
      banner.desktopPublicId = desktopFile.filename;
    }

    // ── Replace mobile asset if a new file was uploaded ──────────────────────
    const mobileFile = req.files?.mobileMedia?.[0];
    if (mobileFile) {
      const resourceType = (mediaType || banner.mediaType) === "video" ? "video" : "image";
      await destroyCloudinaryAsset(banner.mobilePublicId, resourceType);
      banner.mobileMediaUrl = mobileFile.path;
      banner.mobilePublicId = mobileFile.filename;
    }

    await banner.save();
    res.status(200).json({ message: "Banner updated successfully.", banner });
  } catch (error) {
    console.error("updateBanner error:", error);
    res.status(500).json({ message: "Failed to update banner." });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc   Delete a banner and its Cloudinary assets
// @route  DELETE /api/admin/banners/:id
// @access Private (admin)
// ─────────────────────────────────────────────────────────────────────────────
const deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) return res.status(404).json({ message: "Banner not found." });

    const resourceType = banner.mediaType === "video" ? "video" : "image";
    await destroyCloudinaryAsset(banner.desktopPublicId, resourceType);
    await destroyCloudinaryAsset(banner.mobilePublicId,  resourceType);

    await banner.deleteOne();
    res.status(200).json({ message: "Banner deleted successfully." });
  } catch (error) {
    console.error("deleteBanner error:", error);
    res.status(500).json({ message: "Failed to delete banner." });
  }
};

module.exports = {
  getBanners,
  getPublicBanners,
  getBannerById,
  getActiveBanner,
  createBanner,
  updateBanner,
  deleteBanner,
};
