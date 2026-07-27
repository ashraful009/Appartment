const express = require("express");
const router  = express.Router();

const { protect } = require("../../middleware/authMiddleware");
const { getProjects } = require("./projectController");


router.use(protect);
router.get("/", getProjects);

module.exports = router;
