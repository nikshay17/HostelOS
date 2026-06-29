import api from './api';

const authHeader = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

export const enrollFace = (image, token) => api.post('/face/enroll', { image }, authHeader(token));
export const verifyFace = (image, token) => api.post('/face/verify', { image }, authHeader(token));
export const getEnrollmentStatus = (token) => api.get('/face/status', authHeader(token));