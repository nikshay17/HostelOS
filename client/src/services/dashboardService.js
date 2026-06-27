import api from './api';

export const getStudentSummary = (token) =>
  api.get('/dashboard/student', { headers: { Authorization: `Bearer ${token}` } });

export const getWardenSummary = (token) =>
  api.get('/dashboard/warden', { headers: { Authorization: `Bearer ${token}` } });

export const getAdminSummary = (token) =>
  api.get('/dashboard/admin', { headers: { Authorization: `Bearer ${token}` } });