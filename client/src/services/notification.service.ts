import api from "./api";

export const getMyNotifications = async () => {
  const response = await api.get("/notifications");
  return response.data;
};

export const markNotificationAsRead = async (notificationId: number) => {
  const response = await api.post(`/notifications/${notificationId}/read`);
  return response.data;
};

export const markAllNotificationsAsRead = async () => {
  const response = await api.post("/notifications/read-all");
  return response.data;
};
