const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");

const {
    createTask,
    assignTask,
    getTaskDetails,
} = require("../controllers/task.controller");

router.post("/", auth, createTask);
router.post("/:taskId/assign", auth, assignTask);
router.get("/:taskId", auth, getTaskDetails);


module.exports = router;