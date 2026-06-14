const express = require("express");
const router  = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { getProjects } = require("../controllers/projectController");

// Read-only project listing for any authenticated user (members/investors).
router.use(protect);
router.get("/", getProjects);

module.exports = router;
