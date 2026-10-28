const express = require("express");
const { signup,login,verifyOtp } = require("../controllers/auth.controller");

const router = express.Router();

router.post("/signup", signup);

router.post("/login", login);

router.post("/verify-otp", verifyOtp);

router.post("/resend-otp", resendOtp);

module.exports = router;