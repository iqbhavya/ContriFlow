const express = require("express");
const { getUserProfile } = require("../controllers/user.controller");
const auth = require("../middleware/auth");

const router = express.Router();

router.get("/:userId/profile", auth, getUserProfile);

module.exports = router;
