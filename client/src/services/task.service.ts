import api from "./api";
import type { CreateTaskForm } from "../lib/validations/task.schema";


export const createTask = async (data: CreateTaskForm & { projectId: number }) => {
    const response = await api.post("/tasks", data);
    return response.data;
}

export const getProjectTasks = async (projectId: number) => {
  const response = await api.get(`/projects/${projectId}/tasks`);
  return response.data;
};

export const getTask = async (taskId: number) => {
  const response = await api.get(`/tasks/${taskId}`);
  return response.data;
};

export const assignTask = async (
  taskId: number,
  assigneeIds: number[]
) => {
  const response = await api.post(`/tasks/${taskId}/assign`, {
    assigneeIds,
  });

  return response.data;
};

export const getProjectMembers = async (projectId: number) => {
  const response = await api.get(`/dashboard/${projectId}/members`);
  return response.data.members;
};

export const updateTask = async (
  taskId: number,
  data: { title?: string; description?: string; deadline?: string; status?: "TODO" | "IN_PROGRESS" | "DONE" }
) => {
  const response = await api.patch(`/tasks/${taskId}`, data);
  return response.data;
};

export const deleteTask = async (taskId: number) => {
  const response = await api.delete(`/tasks/${taskId}`);
  return response.data;
};

export const removeTaskAssignee = async (taskId: number, userId: number) => {
  const response = await api.delete(`/tasks/${taskId}/assignees/${userId}`);
  return response.data;
};