const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");

const {
  createContribution,
  reviewContribution,
  getTaskContributions,
  getContributionDetails
} = require("../controllers/contribution.controller");

router.post("/", auth, createContribution);
router.patch("/:contributionId/review", auth, reviewContribution);
router.get("/task/:taskId", auth, getTaskContributions);
router.get("/:contributionId", auth, getContributionDetails);

module.exports = router;