const express = require("express");
const router = express.Router();
const { protect, authorizeRoles } = require("../../middleware/authMiddleware");
const { getSubtreeReport, getSubtreeTree, getFullSystemHierarchy } = require("./hierarchyController");

const hierarchyGuard = [protect, authorizeRoles("Director", "GM", "AGM", "area_manager", "seller", "admin")];

router.get("/report", hierarchyGuard, getSubtreeReport);
router.get("/tree", hierarchyGuard, getSubtreeTree);
router.get("/full-system", [protect, authorizeRoles("admin")], getFullSystemHierarchy);

module.exports = router;
