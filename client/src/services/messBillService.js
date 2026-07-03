import api from './api';

const authHeader = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

export const getMyBills = (token) =>
  api.get('/messbills/mine', authHeader(token));

export const submitPaymentProof = (billId, data, token) =>
  api.patch(`/messbills/${billId}/submit-payment`, data, authHeader(token));

export const generateBills = (data, token) =>
  api.post('/messbills/generate', data, authHeader(token));

export const getAllBills = (token, filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  return api.get(`/messbills${params ? `?${params}` : ''}`, authHeader(token));
};

export const approvePayment = (billId, token) =>
  api.patch(`/messbills/${billId}/approve-payment`, {}, authHeader(token));

export const rejectPayment = (billId, data, token) =>
  api.patch(`/messbills/${billId}/reject-payment`, data, authHeader(token));

export const markBillPaid = (billId, token) =>
  api.patch(`/messbills/${billId}/mark-paid`, {}, authHeader(token));

export const deleteBill = (billId, token) =>
  api.delete(`/messbills/${billId}`, authHeader(token));