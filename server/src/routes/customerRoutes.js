const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { getCustomerOverview, getCustomerJourney, getMyUnits } = require("../controllers/customerController");

// GET /api/customer/overview — protected: logged-in users only
router.get("/overview", protect, getCustomerOverview);

// GET /api/customer/journey — protected: logged-in users only
router.get("/journey",  protect, getCustomerJourney);

// GET /api/customer/my-units — protected: returns units where customerId === req.user._id
router.get("/my-units", protect, getMyUnits);

module.exports = router;
