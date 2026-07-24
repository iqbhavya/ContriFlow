import api from "./api";

export const getUserProfile = async (userId: number) => {
  const response = await api.get(`/users/${userId}/profile`);
  return response.data;
};

export const updateUserProfile = async (userId: number, data: { name: string }) => {
  const response = await api.put(`/users/${userId}/profile`, data);
  return response.data;
};

