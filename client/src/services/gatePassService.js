import api from './api';

const authHeader = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

export const createGatePass = (data, token) => api.post('/gatepass', data, authHeader(token));
export const getMyGatePasses = (token) => api.get('/gatepass/mine', authHeader(token));

export const getPendingGatePasses = (token) => api.get('/gatepass/pending', authHeader(token));
export const approveGatePass = (id, token) => api.patch(`/gatepass/${id}/approve`, {}, authHeader(token));
export const rejectGatePass = (id, token) => api.patch(`/gatepass/${id}/reject`, {}, authHeader(token));
export const verifyGatePass = (gatePassId, token) =>
  api.post('/gatepass/verify', { gatePassId }, authHeader(token));