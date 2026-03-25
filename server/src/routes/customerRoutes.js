const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { getCustomerOverview, getCustomerJourney } = require("../controllers/customerController");

// GET /api/customer/overview — protected: logged-in users only
router.get("/overview", protect, getCustomerOverview);

// GET /api/customer/journey — protected: logged-in users only
router.get("/journey", protect, getCustomerJourney);

module.exports = router;
