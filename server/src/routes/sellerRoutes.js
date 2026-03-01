const express = require("express");
const router  = express.Router();

const { protect }        = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/authMiddleware");
const { getMyTeam }      = require("../controllers/sellerController");

// Seller-only guard
const sellerGuard = [protect, authorizeRoles("seller")];

// GET /api/seller/my-team — sub-seller affiliates referred by this seller
router.get("/my-team", sellerGuard, getMyTeam);

module.exports = router;
