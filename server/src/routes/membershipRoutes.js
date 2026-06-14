const express = require("express");
const router  = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { uploadInvoice } = require("../middleware/uploadMiddleware");
const {
  getMyMembership,
  submitBooking,
  submitDownPayment,
  payInstallments,
} = require("../controllers/membershipController");

// All membership routes require an authenticated user.
router.use(protect);

router.get("/me", getMyMembership);
router.post("/booking", uploadInvoice, submitBooking);
router.post("/downpayment", uploadInvoice, submitDownPayment);
router.post("/installments/pay", uploadInvoice, payInstallments);

module.exports = router;
