const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");

const {
    createTask,
    assignTask,
    getTaskDetails,
    updateTask,
    deleteTask,
    removeAssignee,
} = require("../controllers/task.controller");

router.post("/", auth, createTask);
router.post("/:taskId/assign", auth, assignTask);
router.get("/:taskId", auth, getTaskDetails);
router.patch("/:taskId", auth, updateTask);
router.delete("/:taskId", auth, deleteTask);
router.delete("/:taskId/assignees/:userId", auth, removeAssignee);

module.exports = router;