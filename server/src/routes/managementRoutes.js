const express = require("express");
const router = express.Router();
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const {
  makeStageHandlers,
  getMembers,
  getMemberProfile,
} = require("../controllers/paymentStaffController");
const {
  getBuildings,
  getBuildingUnits,
  getInvestors,
  allocateUnit,
  deallocateUnit,
} = require("../controllers/allocationController");

// Stage 3 (final) of the pipeline: DataEntryConfirmed → Paid
const h = makeStageHandlers("management");

router.use(protect);
router.use(authorizeRoles("Management", "admin"));

router.get("/pending", h.getPending);
router.put("/ledger/:id/confirm", h.confirm);
router.put("/ledger/batch/:batchId/confirm", h.confirmBatch);
router.put("/ledger/:id/reject", h.reject);

router.get("/members", getMembers);
router.get("/members/:userId", getMemberProfile);

// ── Building Allocation ──────────────────────────────────────────────────────
router.get("/buildings", getBuildings);
router.get("/buildings/:id/units", getBuildingUnits);
router.get("/investors", getInvestors);
router.post("/allocate", allocateUnit);
router.post("/deallocate", deallocateUnit);

module.exports = router;
