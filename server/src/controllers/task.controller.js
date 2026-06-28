const prisma = require("../lib/prisma");

const createTask = async (req, res) => {
  try {
    const { title, description, projectId } = req.body;

    if (!title || !projectId) {
      return res.status(400).json({
        message: "Title and Project ID are required",
      });
    }

    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
      },
    });

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const projectMembership = await prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId: req.user.userId,
          projectId,
        },
      },
    });

    if (!projectMembership) {
      return res.status(403).json({
        message: "You are not a member of this project",
      });
    }

    if (projectMembership.role !== "LEAD") {
      return res.status(403).json({
        message: "Only project leads can create tasks",
      });
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        projectId,
        createdById: req.user.userId,
        status: "TODO",
      },
    });

    res.status(201).json({
      message: "Task created successfully",
      task: {
        id: task.id,
        title: task.title,
        status: task.status,
        projectId: task.projectId,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const assignTask = async (req, res) => {
  try {
    let { assigneeIds } = req.body;
    const taskId = Number(req.params.taskId);

    if (!Array.isArray(assigneeIds)) {
      return res.status(400).json({
        message: "Assignee IDs must be an array",
      });
    }

    assigneeIds = [...new Set(assigneeIds)];

    if (Number.isNaN(taskId)) {
      return res.status(400).json({
        message: "Invalid task ID",
      });
    }

    if (!assigneeIds || assigneeIds.length === 0) {
      return res.status(400).json({
        message: "Assignee ID are required",
      });
    }

    const task = await prisma.task.findUnique({
      where: {
        id: taskId,
      },
    });

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const projectMembership = await prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId: req.user.userId,
          projectId: task.projectId,
        },
      },
    });

    if (!projectMembership) {
      return res.status(403).json({
        message: "You are not a member of this project",
      });
    }

    if (projectMembership.role !== "LEAD") {
      return res.status(403).json({
        message: "Only project leads can assign tasks",
      });
    }

    const assigneeMembership = await prisma.projectMember.findMany({
      where: {
        userId: {
          in: assigneeIds,
        },
        projectId: task.projectId,
      },
    });

    const memberIds = new Set(
      assigneeMembership.map((member) => member.userId),
    );

    const invalidAssignees = assigneeIds.filter((id) => !memberIds.has(id));

    if (invalidAssignees.length > 0) {
      return res.status(403).json({
        message: "Some users are not members of this project",
        invalidAssignees,
      });
    }

    const taskAssignments = assigneeIds.map((userId) => ({
      taskId: task.id,
      userId,
    }));

    const existingTaskMember = await prisma.taskMember.findMany({
      where: {
        taskId,
        userId: {
          in: assigneeIds,
        },
      },
    });

    const assignedIds = new Set(
      existingTaskMember.map((member) => member.userId),
    );

    const alreadyAssigned = assigneeIds.filter((id) => assignedIds.has(id));

    if (alreadyAssigned.length > 0) {
      return res.status(409).json({
        message: "Some users are already assigned to this task",
        alreadyAssigned,
      });
    }

    const assignedMembers = await prisma.$transaction(async (tx) => {
      const created = await tx.taskMember.createMany({
        data: assigneeIds.map((userId) => ({
          taskId,
          userId,
        })),
      });

      return created;
    });

    res.status(200).json({
      message: "Task assigned successfully",
      assignedCount: assignedMembers.count,
      assignedUsers: assigneeIds,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const getTaskDetails = async (req, res) => {
  try {
    const taskId = Number(req.params.taskId);

    if (Number.isNaN(taskId)) {
      return res.status(400).json({
        message: "Invalid task ID",
      });
    }

    // Find task
    const task = await prisma.task.findUnique({
      where: {
        id: taskId,
      },

      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },

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
    });

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    // Check membership
    const projectMembership = await prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId: req.user.userId,
          projectId: task.project.id,
        },
      },
    });

    if (!projectMembership) {
      return res.status(403).json({
        message: "You are not a member of this project",
      });
    }

    // Format response
    const formattedTask = {
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      deadline: task.deadline,
      createdAt: task.createdAt,

      project: task.project,

      createdBy: task.createdBy,

      assignees: task.members.map((member) => ({
        id: member.user.id,
        name: member.user.name,
        assignedAt: member.assignedAt,
        roleInTask: member.roleInTask,
      })),
    };

    return res.status(200).json(formattedTask);

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};


module.exports = {
  createTask,
  assignTask,
  getTaskDetails,
};
