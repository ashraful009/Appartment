const express = require("express");
const router  = express.Router();

const { protect }        = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/authMiddleware");
const { optionalAuth } = require("../middleware/authMiddleware");

const {
  createRequest,
  getStats,
  getAssignedRequests,
  requestConversion,
  updatePipeline,
} = require("../controllers/requestController");

const { requestSellerConversion } = require("../controllers/sellerController");
const { delegateLead } = require("../controllers/delegationController");

// Public + authenticated users can create a request (guests allowed via optionalAuth)
router.post("/", optionalAuth, createRequest);

// Seller & Admin shared stat route
router.get("/stats", protect, authorizeRoles("seller", "admin"), getStats);

// Seller-only: view leads assigned to them (full contact info revealed)
router.get("/assigned", protect, authorizeRoles("seller"), getAssignedRequests);

// Seller-only: request admin approval to convert an assigned lead to a customer
router.put("/:id/request-conversion", protect, authorizeRoles("seller"), requestConversion);

// Seller-only: request admin approval to convert an assigned lead's user to a seller
router.put("/:id/request-seller-conversion", protect, authorizeRoles("seller"), requestSellerConversion);

// Seller-only: quick update of pipeline stage, priority, clientPreferences
router.put("/:id/pipeline", protect, authorizeRoles("seller"), updatePipeline);

// Seller-only: delegate a lead to a direct sub-seller
router.put("/:id/delegate", protect, authorizeRoles("seller"), delegateLead);

module.exports = router;


