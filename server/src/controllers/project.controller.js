const prisma = require("../lib/prisma");
const { requireProjectMember,
  requireProjectLead
} = require("../utils/projectAuth");


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

    const projectMembership = await requireProjectMember(
      req.user.userId,
      projectId
    );

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
            role: "desc",
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
            members: true,
          },
        },
      },
    });

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const formattedProject = {
      id: project.id,
      name: project.name,
      description: project.description,
      role: projectMembership.role,
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

    if (projectMembership.role === "LEAD") {
      formattedProject.inviteCode = project.inviteCode;
    }

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

    if (!inviteCode) {
      return res.status(400).json({
        message: "Invite code is required",
      });
    }

    const project = await prisma.project.findUnique({
      where: {
        inviteCode: inviteCode,
      },
    });



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

const getProjectTasks = async (req, res) => {

  try {

    const projectId = Number(req.params.projectId);

    if (Number.isNaN(projectId)) {
      return res.status(500).json({
        message: "Invalid project ID",
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
      },
    })

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const projectMembership = await requireProjectMember(
      req.user.userId,
      projectId
    );

    if (!projectMembership) {
      return res.status(403).json({
        message: "You are not a member of this project",
      });
    }

    const projectTask = await prisma.task.findMany({
      where: {
        projectId: projectId,
      },

      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },

        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      }
    })

    const formattedTasks = projectTask.map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      deadline: task.deadline,
      createdAt: task.createdAt,

      createdBy: task.createdBy,

      assignees: task.members.map((member) => ({
        id: member.user.id,
        name: member.user.name,
        assignedAt: member.assignedAt,
        roleInTask: member.roleInTask,
      })),
    }));

    return res.status(200).json({
      project: {
        id: project.id,
        name: project.name,
        description: project.description,
        inviteCode: project.inviteCode,
        createdAt: project.createdAt,
        createdBy: project.createdBy,
      },
      tasks: formattedTasks,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Internal Server Error",
    });
  }
}

const updateProject = async (req, res) => {
  try {
    const projectId = Number(req.params.projectId);

    if (Number.isNaN(projectId)) {
      return res.status(400).json({
        message: "Invalid project ID",
      });
    }

    const { name, description } = req.body;

    if (name === undefined && description === undefined) {
      return res.status(400).json({
        message: "No fields provided to update",
      });
    }

    // Check project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    // Check project lead role
    const projectMembership = await requireProjectLead(req.user.userId, projectId);

    if (projectMembership === null) {
      return res.status(403).json({
        message: "You are not a member of this project",
      });
    }

    if (projectMembership === false) {
      return res.status(403).json({
        message: "Only project leads can edit projects",
      });
    }

    const updateData = {};
    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        return res.status(400).json({
          message: "Project name cannot be empty",
        });
      }
      updateData.name = name.trim();
    }

    if (description !== undefined) {
      if (typeof description !== "string" || !description.trim()) {
        return res.status(400).json({
          message: "Description cannot be empty",
        });
      }
      updateData.description = description.trim();
    }

    const updatedProject = await prisma.project.update({
      where: {
        id: projectId,
      },
      data: updateData,
    });

    return res.status(200).json({
      message: "Project updated successfully",
      project: updatedProject,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const getProjectActivity = async (req, res) => {
  try {
    const projectId = Number(req.params.projectId);

    if (Number.isNaN(projectId)) {
      return res.status(400).json({
        message: "Invalid project ID",
      });
    }

    const membership = await requireProjectMember(
      req.user.userId,
      projectId
    );

    if (!membership) {
      return res.status(403).json({
        message: "You are not a member of this project",
      });
    }

    const members = await prisma.projectMember.findMany({
      where: { projectId },
      include: { user: { select: { name: true } } },
      orderBy: { joinedAt: "desc" },
      take: 15,
    });

    const completedTasks = await prisma.task.findMany({
      where: { projectId, status: "DONE" },
      orderBy: { updatedAt: "desc" },
      take: 15,
    });

    const createdTasks = await prisma.task.findMany({
      where: { projectId },
      include: { createdBy: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 15,
    });

    const contributions = await prisma.contribution.findMany({
      where: { task: { projectId } },
      include: {
        submittedBy: { select: { name: true } },
        task: { select: { title: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 15,
    });

    const activities = [];

    members.forEach((m) => {
      activities.push({
        type: "MEMBER_JOINED",
        message: `${m.user.name} joined the project`,
        timestamp: m.joinedAt,
      });
    });

    completedTasks.forEach((t) => {
      activities.push({
        type: "TASK_COMPLETED",
        message: `Task #${t.id} '${t.title}' was completed`,
        timestamp: t.updatedAt,
      });
    });

    createdTasks.forEach((t) => {
      activities.push({
        type: "TASK_CREATED",
        message: `${t.createdBy.name} created task '${t.title}'`,
        timestamp: t.createdAt,
      });
    });

    contributions.forEach((c) => {
      activities.push({
        type: "CONTRIBUTION_SUBMITTED",
        message: `${c.submittedBy.name} submitted contribution for '${c.task.title}'`,
        timestamp: c.createdAt,
      });
    });

    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return res.status(200).json(activities);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  createProject,
  getMyProjects,
  getProjectDetails,
  joinProject,
  getProjectTasks,
  updateProject,
  getProjectActivity,
};
