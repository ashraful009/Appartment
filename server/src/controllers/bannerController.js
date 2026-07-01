const bannerRepository = require("../repositories/BannerRepository");
const cloudinary = require("../config/cloudinary");
const { logError } = require("../utils/logger");

const destroyCloudinaryAsset = async (publicId, resourceType = "image") => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (err) {
    console.error("[Cloudinary] destroy failed:", publicId, err.message);
  }
};

const getBanners = async (req, res) => {
  try {
    const banners = await bannerRepository.db('banners').orderBy('created_at', 'desc');
    const formattedBanners = banners.map(b => ({
        ...b,
        _id: b.id,
        mediaType: b.media_type,
        desktopMediaUrl: b.desktop_media_url,
        desktopPublicId: b.desktop_public_id,
        mobileMediaUrl: b.mobile_media_url,
        mobilePublicId: b.mobile_public_id,
        isActive: b.is_active
    }));
    res.status(200).json({ banners: formattedBanners });
  } catch (error) {
    console.error("getBanners error:", error);
    logError("getBanners", error);
    res.status(500).json({ message: "Failed to fetch banners." });
  }
};

const getPublicBanners = async (req, res) => {
  try {
    const banners = await bannerRepository.db('banners').where({ is_active: true }).orderBy('created_at', 'desc');
    const formattedBanners = banners.map(b => ({
        ...b,
        _id: b.id,
        mediaType: b.media_type,
        desktopMediaUrl: b.desktop_media_url,
        desktopPublicId: b.desktop_public_id,
        mobileMediaUrl: b.mobile_media_url,
        mobilePublicId: b.mobile_public_id,
        isActive: b.is_active
    }));
    res.status(200).json({ banners: formattedBanners });
  } catch (error) {
    console.error("getPublicBanners error:", error);
    logError("getPublicBanners", error);
    res.status(500).json({ message: "Failed to fetch banners." });
  }
};

const getBannerById = async (req, res) => {
  try {
    const banner = await bannerRepository.findById(req.params.id);
    if (!banner) return res.status(404).json({ message: "Banner not found." });
    
    const formattedBanner = {
        ...banner,
        _id: banner.id,
        mediaType: banner.media_type,
        desktopMediaUrl: banner.desktop_media_url,
        desktopPublicId: banner.desktop_public_id,
        mobileMediaUrl: banner.mobile_media_url,
        mobilePublicId: banner.mobile_public_id,
        isActive: banner.is_active
    };
    
    res.status(200).json({ banner: formattedBanner });
  } catch (error) {
    console.error("getBannerById error:", error);
    logError("getBannerById", error);
    res.status(500).json({ message: "Failed to fetch banner." });
  }
};

const getActiveBanner = async (req, res) => {
  try {
    const banner = await bannerRepository.db('banners').where({ is_active: true }).orderBy('created_at', 'desc').first();
    if (!banner) return res.status(200).json({ banner: null });
    
    const formattedBanner = {
        ...banner,
        _id: banner.id,
        mediaType: banner.media_type,
        desktopMediaUrl: banner.desktop_media_url,
        desktopPublicId: banner.desktop_public_id,
        mobileMediaUrl: banner.mobile_media_url,
        mobilePublicId: banner.mobile_public_id,
        isActive: banner.is_active
    };
    
    res.status(200).json({ banner: formattedBanner });
  } catch (error) {
    console.error("getActiveBanner error:", error);
    logError("getActiveBanner", error);
    res.status(500).json({ message: "Failed to fetch active banner." });
  }
};

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

    const banner = await bannerRepository.create({
      title,
      media_type: mediaType,
      desktop_media_url: desktopFile.path,
      desktop_public_id: desktopFile.filename,
      mobile_media_url:  mobileFile.path,
      mobile_public_id:  mobileFile.filename,
      is_active: isActive === "false" ? false : true,
    });
    
    const formattedBanner = {
        ...banner,
        _id: banner.id,
        mediaType: banner.media_type,
        desktopMediaUrl: banner.desktop_media_url,
        desktopPublicId: banner.desktop_public_id,
        mobileMediaUrl: banner.mobile_media_url,
        mobilePublicId: banner.mobile_public_id,
        isActive: banner.is_active
    };

    res.status(201).json({ message: "Banner created successfully.", banner: formattedBanner });
  } catch (error) {
    console.error("createBanner error:", error);
    logError("createBanner", error);
    res.status(500).json({ message: "Failed to create banner." });
  }
};

const updateBanner = async (req, res) => {
  try {
    const banner = await bannerRepository.findById(req.params.id);
    if (!banner) return res.status(404).json({ message: "Banner not found." });

    const { title, mediaType, isActive } = req.body;
    const updates = {};

    if (title !== undefined) updates.title = title;
    if (mediaType !== undefined) updates.media_type = mediaType;
    if (isActive !== undefined) updates.is_active = isActive === "false" ? false : Boolean(isActive);

    const desktopFile = req.files?.desktopMedia?.[0];
    if (desktopFile) {
      const resourceType = (mediaType || banner.media_type) === "video" ? "video" : "image";
      await destroyCloudinaryAsset(banner.desktop_public_id, resourceType);
      updates.desktop_media_url = desktopFile.path;
      updates.desktop_public_id = desktopFile.filename;
    }

    const mobileFile = req.files?.mobileMedia?.[0];
    if (mobileFile) {
      const resourceType = (mediaType || banner.media_type) === "video" ? "video" : "image";
      await destroyCloudinaryAsset(banner.mobile_public_id, resourceType);
      updates.mobile_media_url = mobileFile.path;
      updates.mobile_public_id = mobileFile.filename;
    }

    const updatedBanner = await bannerRepository.update(banner.id, updates);
    
    const formattedBanner = {
        ...updatedBanner,
        _id: updatedBanner.id,
        mediaType: updatedBanner.media_type,
        desktopMediaUrl: updatedBanner.desktop_media_url,
        desktopPublicId: updatedBanner.desktop_public_id,
        mobileMediaUrl: updatedBanner.mobile_media_url,
        mobilePublicId: updatedBanner.mobile_public_id,
        isActive: updatedBanner.is_active
    };

    res.status(200).json({ message: "Banner updated successfully.", banner: formattedBanner });
  } catch (error) {
    console.error("updateBanner error:", error);
    logError("updateBanner", error);
    res.status(500).json({ message: "Failed to update banner." });
  }
};

const deleteBanner = async (req, res) => {
  try {
    const banner = await bannerRepository.findById(req.params.id);
    if (!banner) return res.status(404).json({ message: "Banner not found." });

    const resourceType = banner.media_type === "video" ? "video" : "image";
    await destroyCloudinaryAsset(banner.desktop_public_id, resourceType);
    await destroyCloudinaryAsset(banner.mobile_public_id,  resourceType);

    await bannerRepository.delete(banner.id);
    res.status(200).json({ message: "Banner deleted successfully." });
  } catch (error) {
    console.error("deleteBanner error:", error);
    logError("deleteBanner", error);
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
