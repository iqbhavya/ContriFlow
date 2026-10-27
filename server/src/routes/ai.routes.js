const express = require("express");
const auth = require("../middleware/auth");

const {
  generateTaskSuggestions,
} = require("../controllers/ai.controller");

const router = express.Router();

router.post("/generate-tasks", auth, generateTaskSuggestions);

module.exports = router;