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

export const getProject = async (projectId: string) => {
  const response = await api.get(`/projects/${projectId}`);
  return response.data;
}

export const getProjectMembers = async (projectId: number) => {
  const response = await api.get(`/projects/${projectId}/members`);
  return response.data.members;
};

export const updateProject = async (projectId: number, data: { name?: string; description?: string }) => {
  const response = await api.patch(`/projects/${projectId}`, data);
  return response.data;
};

export const joinProject = async (inviteCode: string) => {
  const response = await api.post("/projects/join", { inviteCode });
  return response.data;
};

export const getProjectActivity = async (projectId: string) => {
  const response = await api.get(`/projects/${projectId}/activity`);
  return response.data;
};

export const regenerateInviteCode = async (projectId: number) => {
  const response = await api.post(`/projects/${projectId}/invite-code`);
  return response.data;
};

export const leaveProject = async (projectId: number) => {
  const response = await api.post(`/projects/${projectId}/leave`);
  return response.data;
};

export const updateMemberRole = async (projectId: number, memberId: number, action: "MAKE_LEAD" | "DEMOTE" | "TRANSFER") => {
  const response = await api.post(`/projects/${projectId}/members/${memberId}/role`, { action });
  return response.data;
};

export const deleteProject = async (projectId: number) => {
  const response = await api.delete(`/projects/${projectId}`);
  return response.data;
};