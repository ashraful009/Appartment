const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const {
  getCustomerOverview,
  getCustomerJourney,
} = require("../controllers/customerController");

// GET /api/customer/overview
router.get("/overview",                   protect, getCustomerOverview);

// GET /api/customer/journey
router.get("/journey",                    protect, getCustomerJourney);

module.exports = router;
