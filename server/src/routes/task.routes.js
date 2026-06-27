const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");

const {
    createTask,
    assignTask,
} = require("../controllers/task.controller");

router.post("/", auth, createTask);
router.post("/:taskId/assign", auth, assignTask);

module.exports = router;