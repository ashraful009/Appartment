const express = require("express");
const router  = express.Router();

const { protect }        = require("../../middleware/authMiddleware");
const { authorizeRoles } = require("../../middleware/authMiddleware");
const { optionalAuth } = require("../../middleware/authMiddleware");

const {
  createRequest,
  createManualLead,
  getStats,
  getAssignedRequests,
  requestConversion,
  updatePipeline,
} = require("./requestController");

const { requestSellerConversion } = require("../seller/sellerController");
const { delegateLead } = require("../seller/delegationController");

router.post("/", optionalAuth, createRequest);
router.post("/manual", protect, authorizeRoles("seller"), createManualLead);


router.get("/stats", protect, authorizeRoles("seller", "admin"), getStats);


router.get("/assigned", protect, authorizeRoles("seller"), getAssignedRequests);


router.put("/:id/request-conversion", protect, authorizeRoles("seller"), requestConversion);


router.put("/:id/request-seller-conversion", protect, authorizeRoles("seller"), requestSellerConversion);


router.put("/:id/pipeline", protect, authorizeRoles("seller"), updatePipeline);


router.put("/:id/delegate", protect, authorizeRoles("seller"), delegateLead);

module.exports = router;


