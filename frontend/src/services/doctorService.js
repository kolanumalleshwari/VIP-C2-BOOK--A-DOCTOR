import api from './api.js';

export const getDoctors = async (filters = {}) => {
  const params = new URLSearchParams();
  Object.keys(filters).forEach(key => {
    if (filters[key] !== undefined && filters[key] !== '') {
      params.append(key, filters[key]);
    }
  });

  const response = await api.get(`/api/doctors?${params.toString()}`);
  return response.data;
};

export const getDoctorById = async (id) => {
  const response = await api.get(`/api/doctors/${id}`);
  return response.data;
};

export const approveDoctor = async (id, approved) => {
  const response = await api.put(`/api/doctors/${id}/approve`, { approved });
  return response.data;
};
