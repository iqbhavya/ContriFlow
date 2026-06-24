const prisma = require("../lib/prisma");



const createProject = async (req, res) => {

    try {
        const { name, description } = req.body;

        if (!name) {
            return res.status(400).json({
                message: "Project name is required",
            });
        }
        const inviteCode = Math.random()
        .toString(36)
        .substring(2, 10)
        .toUpperCase();

        

        const project = await prisma.project.create({
            data: {
                name,
                description,
                inviteCode,
                createdById: req.user.userId,
            },
        });
        
        await prisma.projectMember.create({
            data: {
                userId : req.user.userId,
                projectId : project.id,
                role : "LEAD",
            },
        });

        res.status(201).json({
            message: "Project created successfully",
            project,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Internal server error",
        });
    }
};


module.exports = {
  createProject,
};