const prisma = require("../lib/prisma");
const {
  requireProjectMember,
  requireProjectLead,
} = require("../utils/projectAuth");

const {
  createTaskService,
  assignTaskService,
  getTaskDetailsService,
  updateTaskService,
} = require("../services/task.service");

const createTask = async (req, res) => {
  try {
    const { title, description, projectId } = req.body;

    if (!title || !projectId) {
      return res.status(400).json({
        message: "Title and Project ID are required",
      });
    }

    const task = await createTaskService({
      userId: req.user.userId,
      title,
      description,
      projectId,
    });

    return res.status(201).json({
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

    return res.status(error.status || 500).json({
      message: error.message || "Internal Server Error",
    });
  }
};

const assignTask = async (req, res) => {
  try {
    const taskId = Number(req.params.taskId);
    let { assigneeIds } = req.body;

    if (Number.isNaN(taskId)) {
      return res.status(400).json({
        message: "Invalid task ID",
      });
    }

    if (!Array.isArray(assigneeIds)) {
      return res.status(400).json({
        message: "Assignee IDs must be an array",
      });
    }

    assigneeIds = [...new Set(assigneeIds)];

    if (assigneeIds.length === 0) {
      return res.status(400).json({
        message: "Assignee IDs are required",
      });
    }

    const result = await assignTaskService({
      userId: req.user.userId,
      taskId,
      assigneeIds,
    });

    return res.status(200).json({
      message: "Task assigned successfully",
      assignedCount: result.assignedCount,
      assignedUsers: result.assignedUsers,
    });
  } catch (error) {
    console.error(error);

    const response = {
      message: error.message || "Internal Server Error",
    };

    if (error.invalidAssignees) {
      response.invalidAssignees = error.invalidAssignees;
    }

    if (error.alreadyAssigned) {
      response.alreadyAssigned = error.alreadyAssigned;
    }

    return res.status(error.status || 500).json(response);
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

    const task = await getTaskDetailsService({
      userId: req.user.userId,
      taskId,
    });

    return res.status(200).json(task);
  } catch (error) {
    console.error(error);

    return res.status(error.status || 500).json({
      message: error.message || "Internal Server Error",
    });
  }
};

const updateTask = async (req, res) => {
  try {
    const taskId = Number(req.params.taskId);

    if (Number.isNaN(taskId)) {
      return res.status(400).json({
        message: "Invalid task ID",
      });
    }

    const { title, description, deadline, status } = req.body;

    if (
      title === undefined &&
      description === undefined &&
      deadline === undefined &&
      status === undefined
    ) {
      return res.status(400).json({
        message: "No fields provided to update",
      });
    }

    const validStatuses = ["TODO", "IN_PROGRESS", "DONE"];

    if (status !== undefined && !validStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid task status",
      });
    }

    const updatedTask = await updateTaskService({
      userId: req.user.userId,
      taskId,
      title,
      description,
      deadline,
      status
    });

    return res.status(200).json({
      message: "Task updated successfully",
      task: {
        id: updatedTask.id,
        title: updatedTask.title,
        description: updatedTask.description,
        deadline: updatedTask.deadline,
        status: updatedTask.status,
        updatedAt: updatedTask.updatedAt,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(error.status || 500).json({
      message: error.message || "Internal Server Error",
    });
  }
};

module.exports = {
  createTask,
  assignTask,
  getTaskDetails,
  updateTask,
};
