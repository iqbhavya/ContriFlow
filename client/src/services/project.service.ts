import api from "../services/api"; // or "../services/api" depending on where your api.ts is

export const getMyProjects = async () => {
  const response = await api.get("/projects");

  return response.data;
};