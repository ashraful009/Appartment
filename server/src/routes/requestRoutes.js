const express = require("express");
const router  = express.Router();

const { protect }        = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/authMiddleware");

const {
  createRequest,
  getStats,
  getAssignedRequests,
  requestConversion,
} = require("../controllers/requestController");

const { requestSellerConversion } = require("../controllers/sellerController");

// Any authenticated user can create a request
router.post("/", protect, createRequest);

// Seller & Admin shared stat route
router.get("/stats", protect, authorizeRoles("seller", "admin"), getStats);

// Seller-only: view leads assigned to them (full contact info revealed)
router.get("/assigned", protect, authorizeRoles("seller"), getAssignedRequests);

// Seller-only: request admin approval to convert an assigned lead to a customer
router.put("/:id/request-conversion", protect, authorizeRoles("seller"), requestConversion);

// Seller-only: request admin approval to convert an assigned lead's user to a seller
router.put("/:id/request-seller-conversion", protect, authorizeRoles("seller"), requestSellerConversion);

module.exports = router;
