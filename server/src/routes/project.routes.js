const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");
const { 
    createProject,
    getMyProjects,
    getProjectDetails,
    joinProject,
 } = require("../controllers/project.controller");

router.post("/", auth, createProject);
router.get("/",auth,getMyProjects);
router.get("/:projectId", auth, getProjectDetails);
router.post("/join", auth, joinProject);

module.exports = router;