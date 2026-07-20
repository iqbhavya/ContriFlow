import api from "./api";
import type { CreateTaskForm } from "../lib/validations/task.schema";


export const createTask = async (data: CreateTaskForm) => {
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