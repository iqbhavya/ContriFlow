const prisma = require("../lib/prisma");
const { requireProjectMember,
        requireProjectLead 
      } = require("../utils/projectAuth");

const createContributionService = async ({
  submittedById,
  taskId,
  title,
  description,
  proofUrl,
  contributors,
}) => {

  // Task exists?
  const task = await prisma.task.findUnique({
    where: {
      id: taskId,
    },
  });

  if (!task) {
    const error = new Error("Task not found");
    error.status = 404;
    throw error;
  }

  // Submitter assigned?
  const submitter = await prisma.taskMember.findUnique({
    where: {
      taskId_userId: {
        taskId,
        userId: submittedById,
      },
    },
  });

  if (!submitter) {
    const error = new Error("You are not assigned to this task");
    error.status = 403;
    throw error;
  }

  // Contributors assigned?
  const assignedMembers = await prisma.taskMember.findMany({
    where: {
      taskId,
      userId: {
        in: contributors,
      },
    },
  });

  const assignedIds = new Set(
    assignedMembers.map((member) => member.userId)
  );

  const invalidContributors = contributors.filter(
    (id) => !assignedIds.has(id)
  );

  if (invalidContributors.length > 0) {
    const error = new Error("Some contributors are not assigned to this task");
    error.status = 403;
    error.invalidContributors = invalidContributors;
    throw error;
  }

  // Transaction
  const contribution = await prisma.$transaction(async (tx) => {

    const createdContribution = await tx.contribution.create({
      data: {
        title,
        description,
        proofUrl,
        taskId,
        submittedById,
      },
    });

    await tx.contributionMember.createMany({
      data: contributors.map((userId) => ({
        contributionId: createdContribution.id,
        userId,
      })),
    });

    return createdContribution;

  });

  return {
    id: contribution.id,
    title: contribution.title,
    status: contribution.status,
    taskId: contribution.taskId,
    contributors,
  };

};



const reviewContributionService = async ({
  reviewerId,
  contributionId,
  status,
  feedback,
}) => {

  const contribution = await prisma.contribution.findUnique({
    where: {
      id: contributionId,
    },

    include: {
      task: true,
    },
  });

  if (!contribution) {
    const error = new Error("Contribution not found");
    error.status = 404;
    throw error;
  }

  if (contribution.status !== "PENDING") {
    const error = new Error("Contribution has already been reviewed");
    error.status = 409;
    throw error;
  }

  const membership = await requireProjectLead(
    reviewerId,
    contribution.task.projectId
  );

  if (membership === null) {
    const error = new Error("You are not a member of this project");
    error.status = 403;
    throw error;
  }

  if (membership === false) {
    const error = new Error("Only project leads can review contributions");
    error.status = 403;
    throw error;
  }

  const updatedContribution = await prisma.contribution.update({
    where: {
      id: contributionId,
    },

    data: {
      status,
      feedback,
      reviewedAt: new Date(),
      reviewedById: reviewerId,
    },
  });

  return {
    id: updatedContribution.id,
    title: updatedContribution.title,
    status: updatedContribution.status,
    feedback: updatedContribution.feedback,
    reviewedAt: updatedContribution.reviewedAt,
  };
};

const getTaskContributionsService = async ({
  userId,
  taskId,
}) => {

  // Check task exists
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
    },
  });

  if (!task) {
    const error = new Error("Task not found");
    error.status = 404;
    throw error;
  }

  // Check project membership
  const membership = await requireProjectMember(
    userId,
    task.projectId
  );

  if (!membership) {
    const error = new Error("You are not a member of this project");
    error.status = 403;
    throw error;
  }

  // Get contributions
  const contributions = await prisma.contribution.findMany({
    where: {
      taskId,
    },

    include: {

      submittedBy: {
        select: {
          id: true,
          name: true,
        },
      },

      reviewedBy: {
        select: {
          id: true,
          name: true,
        },
      },

      contributors: {
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
    },
  });

  return {
    task: {
      id: task.id,
      title: task.title,
      project: task.project,
    },

    contributions: contributions.map((contribution) => ({
      id: contribution.id,
      title: contribution.title,
      description: contribution.description,
      proofUrl: contribution.proofUrl,

      status: contribution.status,

      createdAt: contribution.createdAt,
      updatedAt: contribution.updatedAt,
      reviewedAt: contribution.reviewedAt,

      feedback: contribution.feedback,

      submittedBy: contribution.submittedBy,

      reviewedBy: contribution.reviewedBy,

      contributors: contribution.contributors.map((member) => ({
        id: member.user.id,
        name: member.user.name,
        addedAt: member.addedAt,
      })),
    })),
  };

};

module.exports = {
  createContributionService,
  reviewContributionService,
  getTaskContributionsService,
};