const express = require("express");
const router = express.Router();

const { protect } = require("../../middleware/authMiddleware");
const {
  getCustomerOverview,
  getCustomerJourney,
} = require("./customerController");


router.get("/overview",                   protect, getCustomerOverview);


router.get("/journey",                    protect, getCustomerJourney);

module.exports = router;
