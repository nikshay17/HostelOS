import api from './api';

const authHeader = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

export const registerUser = (data) => api.post('/auth/register', data);
export const loginUser = (data) => api.post('/auth/login', data);
export const getCurrentUser = (token) =>
  api.get('/auth/me', authHeader(token));
export const completeProfile = (data, token) => api.patch('/auth/complete-profile', data, authHeader(token));
export const setGoogleUserPassword = (password, token) =>
  api.post('/auth/set-password', { password }, authHeader(token));

export const verifyOTP = (data) => api.post('/auth/verify-otp', data);
export const resendOTP = (data) => api.post('/auth/resend-otp', data);
