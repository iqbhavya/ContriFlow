import api from "../services/api"; // or "../services/api" depending on where your api.ts is
import type { CreateProjectForm } from "../lib/validations/project.schema";

export const getMyProjects = async () => {
  const response = await api.get("/projects");

  return response.data;
};

export const createProject = async (data: CreateProjectForm) => {
  const response = await api.post("/projects", data);
  return response.data;
};

export const getProject = async (projectId: string) => {
  const response = await api.get(`/projects/${projectId}`);
  return response.data;
}