const express = require("express");
const router = express.Router();
const { protect, authorizeRoles } = require("../../middleware/authMiddleware");
const {
  makeStageHandlers,
  getMembers,
  getMemberProfile,
} = require("./paymentStaffController");
const {
  getBuildings,
  getBuildingUnits,
  getInvestors,
  allocateUnit,
  deallocateUnit,
} = require("./allocationController");


const h = makeStageHandlers("management");

router.use(protect);
router.use(authorizeRoles("Management", "admin"));

router.get("/pending", h.getPending);
router.put("/ledger/:id/confirm", h.confirm);
router.put("/ledger/batch/:batchId/confirm", h.confirmBatch);
router.put("/ledger/:id/reject", h.reject);

router.get("/members", getMembers);
router.get("/members/:userId", getMemberProfile);


router.get("/buildings", getBuildings);
router.get("/buildings/:id/units", getBuildingUnits);
router.get("/investors", getInvestors);
router.post("/allocate", allocateUnit);
router.post("/deallocate", deallocateUnit);


const {
  getAnalysisMemberships,
  extendDueDate,
  resetLedgerEntry,
  updateHandoverTime,
  getPropertiesForAnalysis,
} = require("./analysisController");

router.get("/analysis/memberships", getAnalysisMemberships);
router.get("/analysis/properties", getPropertiesForAnalysis);
router.put("/analysis/ledger/:id/extend", extendDueDate);
router.put("/analysis/ledger/:id/reset", resetLedgerEntry);
router.put("/analysis/unit/:unitId/handover", updateHandoverTime);

module.exports = router;
