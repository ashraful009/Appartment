const express = require("express");
const router = express.Router();

const { updateUnitAction } = require("./propertyController");
const { protect, authorizeRoles } = require("../../middleware/authMiddleware");


router.put(
  "/:unitId/action",
  protect,
  authorizeRoles("admin", "seller"),
  updateUnitAction
);

module.exports = router;
