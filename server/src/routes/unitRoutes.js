const express = require("express");
const router = express.Router();

const { updateUnitAction } = require("../controllers/propertyController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// PUT /api/units/:unitId/action - protected by auth, allowed for 'admin' and 'seller'
router.put(
  "/:unitId/action",
  protect,
  authorizeRoles("admin", "seller"),
  updateUnitAction
);

module.exports = router;
