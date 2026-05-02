const express = require("express");
const router = express.Router();

const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const { createArea, getAreas, deleteArea } = require("../controllers/areaController");

// GET  /api/areas        — public (for dropdowns on homepage + admin forms)
router.get("/", getAreas);

// POST /api/areas         — admin only
router.post("/", protect, authorizeRoles("admin"), createArea);

// DELETE /api/areas/:id   — admin only
router.delete("/:id", protect, authorizeRoles("admin"), deleteArea);

module.exports = router;
