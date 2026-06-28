const prisma = require("../lib/prisma");

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

module.exports = {
  createContributionService,
};