const express = require("express");
const { getProfile, updateProfile, uploadAvatarController } = require("./userController");
const { protect } = require("../../middleware/authMiddleware");
const { uploadAvatar } = require("../../middleware/uploadMiddleware");

const router = express.Router();

router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.post("/avatar", protect, uploadAvatar, uploadAvatarController);

module.exports = router;
