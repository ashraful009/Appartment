const express = require("express");
const router = express.Router();
const { protect, authorizeRoles } = require("../../middleware/authMiddleware");
const { getPool, getRecipients, distributeLeads } = require("./distributionController");

router.get("/pool", protect, authorizeRoles("admin", "Director", "GM", "AGM", "area_manager"), getPool);
router.get("/recipients", protect, authorizeRoles("admin", "Director", "GM", "AGM", "area_manager"), getRecipients);
router.post("/distribute", protect, authorizeRoles("admin", "Director", "GM", "AGM", "area_manager"), distributeLeads);

module.exports = router;
