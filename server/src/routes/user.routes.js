const express = require("express");
const { getUserProfile, updateUserProfile } = require("../controllers/user.controller");
const auth = require("../middleware/auth");

const router = express.Router();

router.get("/:userId/profile", auth, getUserProfile);
router.put("/:userId/profile", auth, updateUserProfile);

module.exports = router;
