const prisma = require("../lib/prisma");

const {
  requireProjectMember,
  requireProjectLead,
} = require("../utils/projectAuth");

const getProjectDashboardService = async ({
  userId,
  projectId,
}) => {

  // Check membership
  const membership = await requireProjectMember(
    userId,
    projectId
  );

  if (!membership) {
    const error = new Error("You are not a member of this project");
    error.status = 403;
    throw error;
  }

  // Get project
  const project = await prisma.project.findUnique({
    where: {
      id: projectId,
    },

    select: {
      id: true,
      name: true,
      description: true,
      createdAt: true,
    },
  });

  if (!project) {
    const error = new Error("Project not found");
    error.status = 404;
    throw error;
  }

  // Member count
  const members = await prisma.projectMember.count({
    where: {
      projectId,
    },
  });

  // Task counts
  const todoTasks = await prisma.task.count({
    where: {
      projectId,
      status: "TODO",
    },
  });

  const inProgressTasks = await prisma.task.count({
    where: {
      projectId,
      status: "IN_PROGRESS",
    },
  });

  const completedTasks = await prisma.task.count({
    where: {
      projectId,
      status: "DONE",
    },
  });

  const totalTasks = todoTasks + inProgressTasks + completedTasks;

  // Contribution counts
  const pendingContributions = await prisma.contribution.count({
    where: {
      task: {
        projectId,
      },
      status: "PENDING",
    },
  });

  const approvedContributions = await prisma.contribution.count({
    where: {
      task: {
        projectId,
      },
      status: "APPROVED",
    },
  });

  const rejectedContributions = await prisma.contribution.count({
    where: {
      task: {
        projectId,
      },
      status: "REJECTED",
    },
  });

  const totalContributions =
    pendingContributions +
    approvedContributions +
    rejectedContributions;

  return {
    project,

    stats: {
      members,

      tasks: totalTasks,
      todoTasks,
      inProgressTasks,
      completedTasks,

      contributions: totalContributions,
      pendingContributions,
      approvedContributions,
      rejectedContributions,
    },
  };
};

module.exports = {
  getProjectDashboardService,
};