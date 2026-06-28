const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");

const {
  createContribution,
  reviewContribution,
} = require("../controllers/contribution.controller");

router.post("/", auth, createContribution);
router.patch("/:contributionId/review", auth, reviewContribution);

module.exports = router;