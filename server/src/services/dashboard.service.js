const prisma = require("../lib/prisma");

const {
  requireProjectMember,
  requireProjectLead,
} = require("../utils/projectAuth");

const { getMemberStats } = require("../utils/memberStats");

const getProjectDashboardService = async ({ userId, projectId }) => {
  // Check membership
  const membership = await requireProjectMember(userId, projectId);

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
  const memberCount = await prisma.projectMember.count({
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
    pendingContributions + approvedContributions + rejectedContributions;

  // Get all project members
  const projectMembers = await prisma.projectMember.findMany({
    where: {
      projectId,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  const leaderboard = await Promise.all(
    projectMembers.map(async (member) => {
      const stats = await getMemberStats(member.user.id, projectId);

      return {
        id: member.user.id,
        name: member.user.name,
        ...stats,
      };
    }),
  );

  // Sort leaderboard
  leaderboard.sort((a, b) => {
    if (b.approvedContributions !== a.approvedContributions) {
      return b.approvedContributions - a.approvedContributions;
    }

    return b.approvalRate - a.approvalRate;
  });

  // Add ranks
  const rankedLeaderboard = leaderboard.map((member, index) => ({
    rank: index + 1,
    ...member,
  }));

  return {
    project,

    stats: {
      members: memberCount,

      tasks: totalTasks,
      todoTasks,
      inProgressTasks,
      completedTasks,

      contributions: totalContributions,
      pendingContributions,
      approvedContributions,
      rejectedContributions,
    },

    leaderboard: rankedLeaderboard,
  };
};

const getMemberStatisticsService = async ({ userId, projectId }) => {
  const membership = await requireProjectMember(userId, projectId);

  if (!membership) {
    const error = new Error("You are not a member of this project");
    error.status = 403;
    throw error;
  }

  const projectMembers = await prisma.projectMember.findMany({
    where: {
      projectId,
    },

    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  const statistics = await Promise.all(
    projectMembers.map(async (member) => {
      const stats = await getMemberStats(member.user.id, projectId);

      return {
        id: member.user.id,
        name: member.user.name,
        email: member.user.email,
        role: member.role,
        ...stats,
      };
    }),
  );

  statistics.sort((a, b) => {
    if (b.approvedContributions !== a.approvedContributions) {
      return b.approvedContributions - a.approvedContributions;
    }

    return b.approvalRate - a.approvalRate;
  });

  return statistics;
};

module.exports = {
  getProjectDashboardService,
  getMemberStatisticsService,
};
