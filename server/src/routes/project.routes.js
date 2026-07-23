const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");
const {
    createProject,
    getMyProjects,
    getProjectDetails,
    joinProject,
    getProjectTasks,
    updateProject,
    getProjectActivity,
    regenerateInviteCode,
    leaveProject,
    updateMemberRole,
    deleteProject
} = require("../controllers/project.controller");

router.post("/", auth, createProject);
router.get("/", auth, getMyProjects);
router.get("/:projectId/tasks", auth, getProjectTasks);
router.get("/:projectId", auth, getProjectDetails);
router.get("/:projectId/activity", auth, getProjectActivity);
router.post("/join", auth, joinProject);
router.patch("/:projectId", auth, updateProject);
router.post("/:projectId/invite-code", auth, regenerateInviteCode);
router.post("/:projectId/leave", auth, leaveProject);
router.post("/:projectId/members/:memberId/role", auth, updateMemberRole);
router.delete("/:projectId", auth, deleteProject);

module.exports = router;