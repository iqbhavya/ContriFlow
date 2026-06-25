const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");
const { 
    createProject,
    getMyProjects,
 } = require("../controllers/project.controller");

router.post("/", auth, createProject);

router.get("/",auth,getMyProjects);

module.exports = router;