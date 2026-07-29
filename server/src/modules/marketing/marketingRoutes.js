const express = require("express");
const router = express.Router();
const { protect, authorizeRoles } = require("../../middleware/authMiddleware");
const { generateLink, submitLinkLead, getLinkDetails } = require("./marketingController");

router.post("/link", protect, authorizeRoles("seller"), generateLink);
router.get("/link/:slug", getLinkDetails);
router.post("/link/:slug", submitLinkLead);

module.exports = router;
