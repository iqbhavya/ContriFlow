const express = require("express");
const {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
} = require("../controllers/notification.controller");
const auth = require("../middleware/auth");

const router = express.Router();

router.get("/", auth, getMyNotifications);
router.post("/read-all", auth, markAllAsRead);
router.post("/:notificationId/read", auth, markAsRead);

module.exports = router;
