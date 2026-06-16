import api from './api.js';

export const uploadReport = async (formData) => {
  const response = await api.post('/api/reports/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getReports = async (patientId = '') => {
  const url = patientId ? `/api/reports?patientId=${patientId}` : '/api/reports';
  const response = await api.get(url);
  return response.data;
};

export const deleteReport = async (id) => {
  const response = await api.delete(`/api/reports/${id}`);
  return response.data;
};
