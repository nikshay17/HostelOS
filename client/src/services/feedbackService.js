import api from './api';

const authHeader = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

export const createFeedback = (data, token) => api.post('/feedback', data, authHeader(token));
export const getMyFeedback = (token) => api.get('/feedback/mine', authHeader(token));
export const getAllFeedback = (token, filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  return api.get(`/feedback${params ? `?${params}` : ''}`, authHeader(token));
};
export const getFeedbackSummary = (token) => api.get('/feedback/summary', authHeader(token));