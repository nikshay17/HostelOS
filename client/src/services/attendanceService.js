import api from './api';

const authHeader = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

export const markAttendance = (coords, token) => api.post('/attendance', coords, authHeader(token));
export const getMyAttendance = (token) => api.get('/attendance/mine', authHeader(token));

export const getTodayAttendance = (token) => api.get('/attendance/today', authHeader(token));
export const markAbsent = (studentId, token) =>
  api.post('/attendance/mark-absent', { studentId }, authHeader(token));
export const getStudentAttendance = (studentId, token, range = {}) => {
  const params = new URLSearchParams(range).toString();
  return api.get(`/attendance/student/${studentId}${params ? `?${params}` : ''}`, authHeader(token));
};