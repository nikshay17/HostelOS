import api from './api';

const authHeader = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

export const getFullAnalytics = (token) => api.get('/analytics/full', authHeader(token));
export const getOccupancyStats = (token) => api.get('/analytics/occupancy', authHeader(token));
export const getComplaintStats = (token) => api.get('/analytics/complaints', authHeader(token));
export const getMessBillStats = (token) => api.get('/analytics/messbills', authHeader(token));
export const getAttendanceTrend = (token) => api.get('/analytics/attendance-trend', authHeader(token));
export const getGatePassStats = (token) => api.get('/analytics/gatepasses', authHeader(token));