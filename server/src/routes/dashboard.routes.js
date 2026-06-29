const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");

const {
  getProjectDashboard,
} = require("../controllers/dashboard.controller");

router.get("/:projectId", auth, getProjectDashboard);

module.exports = router;