import api from './api';

const authHeader = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

export const createComplaint = (data, token) => api.post('/complaints', data, authHeader(token));
export const getMyComplaints = (token) => api.get('/complaints/mine', authHeader(token));
export const deleteComplaint = (id, token) => api.delete(`/complaints/${id}`, authHeader(token));

export const getAllComplaints = (token, filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  return api.get(`/complaints${params ? `?${params}` : ''}`, authHeader(token));
};
export const updateComplaintStatus = (id, data, token) =>
  api.patch(`/complaints/${id}/status`, data, authHeader(token));