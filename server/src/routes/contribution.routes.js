const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");

const {
  createContribution,
} = require("../controllers/contribution.controller");

router.post("/", auth, createContribution);

module.exports = router;