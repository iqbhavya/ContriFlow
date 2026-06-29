const prisma = require("../lib/prisma");

const getMemberStats = async (userId, projectId) => {

  const [
    assignedTasks,
    completedTasks,
    approvedContributions,
    pendingContributions,
    rejectedContributions,
  ] = await Promise.all([

    prisma.taskMember.count({
      where: {
        userId,
        task: {
          projectId,
        },
      },
    }),

    prisma.taskMember.count({
      where: {
        userId,
        task: {
          projectId,
          status: "DONE",
        },
      },
    }),

    prisma.contributionMember.count({
      where: {
        userId,
        contribution: {
          status: "APPROVED",
          task: {
            projectId,
          },
        },
      },
    }),

    prisma.contributionMember.count({
      where: {
        userId,
        contribution: {
          status: "PENDING",
          task: {
            projectId,
          },
        },
      },
    }),

    prisma.contributionMember.count({
      where: {
        userId,
        contribution: {
          status: "REJECTED",
          task: {
            projectId,
          },
        },
      },
    }),
  ]);

  const totalReviewed =
    approvedContributions + rejectedContributions;

  const approvalRate =
    totalReviewed === 0
      ? 0
      : Math.round(
          (approvedContributions / totalReviewed) * 100
        );

  return {
    assignedTasks,
    completedTasks,
    approvedContributions,
    pendingContributions,
    rejectedContributions,
    approvalRate,
  };
};

module.exports = {
  getMemberStats,
};