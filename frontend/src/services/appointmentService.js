import api from './api.js';

export const bookAppointment = async (appointmentData) => {
  const response = await api.post('/api/appointments', appointmentData);
  return response.data;
};

export const getAppointments = async () => {
  const response = await api.get('/api/appointments');
  return response.data;
};

export const updateAppointmentStatus = async (id, status) => {
  const response = await api.put(`/api/appointments/${id}`, { status });
  return response.data;
};
