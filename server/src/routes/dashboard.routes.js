const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");

const {
  getProjectDashboard,
  getMemberStatistics
} = require("../controllers/dashboard.controller");

router.get("/:projectId", auth, getProjectDashboard);
router.get("/:projectId/members", auth, getMemberStatistics);


module.exports = router;