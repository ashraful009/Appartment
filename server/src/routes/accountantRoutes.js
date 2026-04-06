const express = require("express");
const router = express.Router();
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const { getSoldUnits, updateUnitDetails, getAllPayments, updatePaymentStatus } = require("../controllers/accountantController");

// Protect all routes and restrict to Accountant and Admin
router.use(protect);
router.use(authorizeRoles("Accountant", "admin", "Accountent"));

// Routes
router.get("/units", getSoldUnits);
router.put("/units/:id/details", updateUnitDetails);

router.get("/installments", getAllPayments);
router.put("/installments/:id/status", updatePaymentStatus);

module.exports = router;
