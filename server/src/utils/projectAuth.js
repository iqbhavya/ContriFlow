const prisma = require("../lib/prisma");

const requireProjectMember = async (userId, projectId) => {
  const membership = await prisma.projectMember.findUnique({
    where: {
      userId_projectId: {
        userId,
        projectId,
      },
    },
  });

  return membership;
};

const requireProjectLead = async (userId, projectId) => {
  const membership = await requireProjectMember(userId, projectId);

  if (!membership) {
    return null;
  }

  return membership.role === "LEAD" ? membership : false;
};

module.exports = {
  requireProjectMember,
  requireProjectLead
};