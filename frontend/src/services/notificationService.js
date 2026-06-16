import api from './api.js';

export const getNotifications = async () => {
  const response = await api.get('/api/notifications');
  return response.data;
};

export const markNotificationsRead = async (id = null) => {
  const response = await api.put('/api/notifications/read', id ? { id } : {});
  return response.data;
};
