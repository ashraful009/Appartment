const express = require("express");
const router  = express.Router();

const { protect }        = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/authMiddleware");

const {
  createRequest,
  getStats,
  getPendingRequests,
  claimRequest,
  getClaimedRequests,
} = require("../controllers/requestController");

// Any authenticated user can create a request (customer, user, etc.)
router.post("/",              protect,                            createRequest);

// Seller & Admin shared routes
router.get("/stats",          protect, authorizeRoles("seller", "admin"), getStats);
router.get("/pending",        protect, authorizeRoles("seller", "admin"), getPendingRequests);
router.put("/:id/claim",      protect, authorizeRoles("seller", "admin"), claimRequest);
router.get("/claimed",        protect, authorizeRoles("seller", "admin"), getClaimedRequests);

module.exports = router;
