import api from './api';

const authHeader = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

export const getAuditLogs = (token, filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  return api.get(`/security/audit-logs${params ? `?${params}` : ''}`, authHeader(token));
};