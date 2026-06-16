import api from './api.js';

export const getAdminAnalytics = async () => {
  const response = await api.get('/api/analytics/admin');
  return response.data;
};

export const getDoctorAnalytics = async () => {
  const response = await api.get('/api/analytics/doctor');
  return response.data;
};
