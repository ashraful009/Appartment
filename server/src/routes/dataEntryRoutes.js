const express = require("express");
const router = express.Router();
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const {
  makeStageHandlers,
  getMembers,
  getMemberProfile,
} = require("../controllers/paymentStaffController");

// Stage 2 of the pipeline: AccountantConfirmed → DataEntryConfirmed
const h = makeStageHandlers("dataEntry");

router.use(protect);
router.use(authorizeRoles("DataEntry", "admin"));

router.get("/pending", h.getPending);
router.put("/ledger/:id/confirm", h.confirm);
router.put("/ledger/batch/:batchId/confirm", h.confirmBatch);
router.put("/ledger/:id/reject", h.reject);

router.get("/members", getMembers);
router.get("/members/:userId", getMemberProfile);

module.exports = router;
