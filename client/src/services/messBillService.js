import api from './api';

const authHeader = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

export const getMyBills = (token) => api.get('/messbills/mine', authHeader(token));
export const payBill = (billId, token) => api.patch(`/messbills/${billId}/pay`, {}, authHeader(token));

export const generateBills = (data, token) => api.post('/messbills/generate', data, authHeader(token));
export const getAllBills = (token, filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  return api.get(`/messbills${params ? `?${params}` : ''}`, authHeader(token));
};
export const markBillPaid = (billId, token) => api.patch(`/messbills/${billId}/mark-paid`, {}, authHeader(token));
export const deleteBill = (billId, token) => api.delete(`/messbills/${billId}`, authHeader(token));