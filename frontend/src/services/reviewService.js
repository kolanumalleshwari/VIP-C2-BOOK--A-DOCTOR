import api from './api.js';

export const createReview = async (reviewData) => {
  const response = await api.post('/api/reviews', reviewData);
  return response.data;
};

export const updateReview = async (id, reviewData) => {
  const response = await api.put(`/api/reviews/${id}`, reviewData);
  return response.data;
};

export const deleteReview = async (id) => {
  const response = await api.delete(`/api/reviews/${id}`);
  return response.data;
};
