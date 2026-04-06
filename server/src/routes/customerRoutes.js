const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const {
  getCustomerOverview,
  getCustomerJourney,
  getMyUnits,
  getInstallmentsByUnit,
  submitPaymentProof,
} = require("../controllers/customerController");
const { uploadInvoice } = require("../middleware/uploadMiddleware");

// GET /api/customer/overview
router.get("/overview",                   protect, getCustomerOverview);

// GET /api/customer/journey
router.get("/journey",                    protect, getCustomerJourney);

// GET /api/customer/my-units
router.get("/my-units",                   protect, getMyUnits);

// GET /api/customer/installments/:unitId
router.get("/installments/:unitId",       protect, getInstallmentsByUnit);

// PUT /api/customer/installments/:id/pay
router.put("/installments/:id/pay",       protect, uploadInvoice, submitPaymentProof);

module.exports = router;
