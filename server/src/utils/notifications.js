const prisma = require("../lib/prisma");

const createNotification = async (userId, message) => {
  try {
    await prisma.notification.create({
      data: {
        userId,
        message,
      },
    });
  } catch (error) {
    console.error("Failed to create notification:", error);
  }
};

const notifyProjectMembers = async (projectId, message, excludeUserId = null) => {
  try {
    const members = await prisma.projectMember.findMany({
      where: { projectId },
      select: { userId: true },
    });

    const userIds = members
      .map((m) => m.userId)
      .filter((uid) => uid !== excludeUserId);

    if (userIds.length === 0) return;

    await prisma.notification.createMany({
      data: userIds.map((userId) => ({
        userId,
        message,
      })),
    });
  } catch (error) {
    console.error("Failed to notify project members:", error);
  }
};

module.exports = {
  createNotification,
  notifyProjectMembers,
};
