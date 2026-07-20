import api from "../services/api"; 
import type { CreateProjectForm } from "../lib/validations/project.schema";

export const getMyProjects = async () => {
  const response = await api.get("/projects");

  return response.data;
};

export const createProject = async (data: CreateProjectForm) => {
  const response = await api.post("/projects", data);
  return response.data;
};

export const getProject = async (projectId: number) => {
  const response = await api.get(`/projects/${projectId}`);
  return response.data;
}

export const getProjectMembers = async (projectId: number) => {
  const response = await api.get(`/projects/${projectId}/members`);
  return response.data.members;
};