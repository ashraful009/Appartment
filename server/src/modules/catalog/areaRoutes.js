const express = require("express");
const router = express.Router();

const { protect, authorizeRoles } = require("../../middleware/authMiddleware");
const { createArea, getAreas, deleteArea } = require("./areaController");


router.get("/", getAreas);


router.post("/", protect, authorizeRoles("admin"), createArea);


router.delete("/:id", protect, authorizeRoles("admin"), deleteArea);

module.exports = router;
