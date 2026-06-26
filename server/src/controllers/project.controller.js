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
        userId: req.user.userId,
        projectId: project.id,
        role: "LEAD",
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

const getMyProjects = async (req, res) => {
  try {
    const projects = await prisma.projectMember.findMany({
      where: {
        userId: req.user.userId,
      },
      include: {
        project: true,
      },
    });

    const formattedProjects = projects.map((p) => ({
      id: p.project.id,
      name: p.project.name,
      description: p.project.description,
      inviteCode: p.project.inviteCode,
      role: p.role,
    }));

    res.status(200).json(formattedProjects);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

const getProjectDetails = async (req, res) => {
  try {
    const projectId = Number(req.params.projectId);

    if (!Number.isInteger(projectId)) {
      return res.status(400).json({
        message: "Invalid project ID",
      });
    }

    const projectMembership = await prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId: req.user.userId,
          projectId: projectId,
        },
      },
    });

    if (!projectMembership) {
      return res.status(403).json({
        message: "You are not a member of this project",
      });
    }

    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
      },

      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },

        members: {
          orderBy: {
            role: "asc",
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },

        _count: {
          select: {
            tasks: true,
            contributions: true,
            members: true,
          },
        },
      },
    });

    const formattedProject = {
      id: project.id,
      name: project.name,
      description: project.description,
      inviteCode: project.inviteCode,
      createdAt: project.createdAt,

      createdBy: project.createdBy,

      members: project.members.map((member) => ({
        id: member.user.id,
        name: member.user.name,
        role: member.role,
        joinedAt: member.joinedAt,
      })),

      stats: {
        members: project._count.members,
        tasks: project._count.tasks,
        contributions: project._count.contributions,
      },
    };

    return res.status(200).json(formattedProject);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const joinProject = async (req, res) => {
  try {
    const { inviteCode } = req.body;

    

    const project = await prisma.project.findUnique({
      where: {
        inviteCode: inviteCode,
      },
    });

    if (!inviteCode) {
      return res.status(400).json({
        message: "Invite code is required",
      });
    }

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const existingMembership = await prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId: req.user.userId,
          projectId: project.id,
        },
      },
    });

    if (existingMembership) {
      return res.status(409).json({
        message: "You are already a member of this project",
      });
    }

    await prisma.projectMember.create({
      data: {
        userId: req.user.userId,
        projectId: project.id,
        role: "MEMBER",
      },
    });

    res.status(200).json({
      message: "Successfully joined the project",
      project: {
        id: project.id,
        name: project.name,
        description: project.description,
        inviteCode: project.inviteCode,
        role: "MEMBER",
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  createProject,
  getMyProjects,
  getProjectDetails,
  joinProject,
};
