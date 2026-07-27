const express = require("express");
const router  = express.Router();

const { getPublicBanners, getActiveBanner } = require("./bannerController");
const { getPublicProperties, getPropertyById, getPropertyUnits } = require("./propertyController");
const { optionalAuth } = require("../../middleware/authMiddleware");




router.get("/banners/active", getActiveBanner);


router.get("/banners", getPublicBanners);




router.get("/properties/public", getPublicProperties);


router.get("/properties", getPublicProperties);


router.get("/properties/:id", getPropertyById);


router.get("/properties/:id/units", optionalAuth, getPropertyUnits);

module.exports = router;
