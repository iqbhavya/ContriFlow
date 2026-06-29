const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");

const {
    createTask,
    assignTask,
    getTaskDetails,
    updateTask,
    deleteTask,
} = require("../controllers/task.controller");

router.post("/", auth, createTask);
router.post("/:taskId/assign", auth, assignTask);
router.get("/:taskId", auth, getTaskDetails);
router.patch("/:taskId", auth, updateTask);
router.delete("/:taskId", auth, deleteTask);

module.exports = router;