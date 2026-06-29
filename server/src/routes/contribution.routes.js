const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");

const {
  createContribution,
  reviewContribution,
  getTaskContributions,
  getContributionDetails,
  updateContribution
} = require("../controllers/contribution.controller");

router.post("/", auth, createContribution);
router.patch("/:contributionId/review", auth, reviewContribution);
router.get("/task/:taskId", auth, getTaskContributions);
router.get("/:contributionId", auth, getContributionDetails);
router.patch("/:contributionId", auth, updateContribution);

module.exports = router;