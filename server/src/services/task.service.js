const prisma = require("../lib/prisma");
const { requireProjectMember,
        requireProjectLead 
      } = require("../utils/projectAuth");

const createTaskService = async ({
  userId,
  title,
  description,
  projectId,
}) => {
  // Check project
  const project = await prisma.project.findUnique({
    where: {
      id: projectId,
    },
  });

  if (!project) {
    const error = new Error("Project not found");
    error.status = 404;
    throw error;
  }

  // Check lead
  const projectMembership = await requireProjectLead(
    userId,
    projectId
  );

  if (projectMembership === null) {
    const error = new Error("You are not a member of this project");
    error.status = 403;
    throw error;
  }

  if (projectMembership === false) {
    const error = new Error("Only project leads can create tasks");
    error.status = 403;
    throw error;
  }

  // Create task
  const task = await prisma.task.create({
    data: {
      title,
      description,
      projectId,
      createdById: userId,
      status: "TODO",
    },
  });

  return task;
};


const assignTaskService = async ({
  userId,
  taskId,
  assigneeIds,
}) => {
  // Find task
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

  // Check lead
  const membership = await requireProjectLead(
    userId,
    task.projectId
  );

  if (membership === null) {
    const error = new Error("You are not a member of this project");
    error.status = 403;
    throw error;
  }

  if (membership === false) {
    const error = new Error("Only project leads can assign tasks");
    error.status = 403;
    throw error;
  }

  // Check assignees belong to project
  const assigneeMembership = await prisma.projectMember.findMany({
    where: {
      projectId: task.projectId,
      userId: {
        in: assigneeIds,
      },
    },
  });

  const memberIds = new Set(
    assigneeMembership.map((member) => member.userId)
  );

  const invalidAssignees = assigneeIds.filter(
    (id) => !memberIds.has(id)
  );

  if (invalidAssignees.length > 0) {
    const error = new Error("Some users are not members of this project");
    error.status = 403;
    error.invalidAssignees = invalidAssignees;
    throw error;
  }

  // Already assigned?
  const existingTaskMembers = await prisma.taskMember.findMany({
    where: {
      taskId,
      userId: {
        in: assigneeIds,
      },
    },
  });

  const assignedIds = new Set(
    existingTaskMembers.map((member) => member.userId)
  );

  const alreadyAssigned = assigneeIds.filter((id) =>
    assignedIds.has(id)
  );

  if (alreadyAssigned.length > 0) {
    const error = new Error("Some users are already assigned");
    error.status = 409;
    error.alreadyAssigned = alreadyAssigned;
    throw error;
  }

  // Assign
  const assignedMembers = await prisma.taskMember.createMany({
    data: assigneeIds.map((userId) => ({
      taskId,
      userId,
    })),
  });

  return {
    assignedCount: assignedMembers.count,
    assignedUsers: assigneeIds,
  };
};

const getTaskDetailsService = async ({ userId, taskId }) => {
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
    const error = new Error("Task not found");
    error.status = 404;
    throw error;
  }

  const membership = await requireProjectMember(
    userId,
    task.project.id
  );

  if (!membership) {
    const error = new Error("You are not a member of this project");
    error.status = 403;
    throw error;
  }

  return {
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
};

const updateTaskService = async ({
  userId,
  taskId,
  title,
  description,
  deadline,
}) => {
  // Find task
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

  // Check if user is project lead
  const membership = await requireProjectLead(
    userId,
    task.projectId
  );

  if (membership === null) {
    const error = new Error("You are not a member of this project");
    error.status = 403;
    throw error;
  }

  if (membership === false) {
    const error = new Error("Only project leads can update tasks");
    error.status = 403;
    throw error;
  }

  // Build update object
  const updateData = {};

  if (title !== undefined) {
    updateData.title = title;
  }

  if (description !== undefined) {
    updateData.description = description;
  }

  if (deadline !== undefined) {
    updateData.deadline = deadline;
  }

  // Update task
  const updatedTask = await prisma.task.update({
    where: {
      id: taskId,
    },
    data: updateData,
  });

  return updatedTask;
};



module.exports = {
  createTaskService,  
  assignTaskService,
  getTaskDetailsService,  
  updateTaskService,
};