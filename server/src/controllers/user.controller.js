const prisma = require("../lib/prisma");

const getUserProfile = async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    if (Number.isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const memberships = await prisma.projectMember.findMany({
      where: { userId },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
      orderBy: { joinedAt: "desc" },
    });

    const contributions = await prisma.contribution.findMany({
      where: { submittedById: userId },
      include: {
        task: {
          select: {
            id: true,
            title: true,
            project: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const taskAssignments = await prisma.taskMember.findMany({
      where: { userId },
      include: {
        task: {
          select: {
            id: true,
            title: true,
            status: true,
            project: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: { assignedAt: "desc" },
    });

    return res.status(200).json({
      user,
      projects: memberships.map((m) => ({
        id: m.project.id,
        name: m.project.name,
        description: m.project.description,
        role: m.role,
        joinedAt: m.joinedAt,
      })),
      contributions: contributions.map((c) => ({
        id: c.id,
        title: c.title,
        status: c.status,
        createdAt: c.createdAt,
        task: c.task,
      })),
      tasks: taskAssignments.map((t) => ({
        id: t.task.id,
        title: t.task.title,
        status: t.task.status,
        project: t.task.project,
        assignedAt: t.assignedAt,
      })),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  getUserProfile,
};
