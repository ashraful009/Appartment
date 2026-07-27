const express = require("express");
const router  = express.Router();

const { protect } = require("../../middleware/authMiddleware");
const { uploadInvoice } = require("../../middleware/uploadMiddleware");
const {
  getMyMembership,
  getMyMembershipDetail,
  submitBooking,
  submitDownPayment,
  payInstallments,
} = require("./membershipController");


router.use(protect);

router.get("/me", getMyMembership);
router.get("/me/:membershipId", getMyMembershipDetail);
router.post("/booking", uploadInvoice, submitBooking);
router.post("/downpayment", uploadInvoice, submitDownPayment);
router.post("/installments/pay", uploadInvoice, payInstallments);

module.exports = router;
