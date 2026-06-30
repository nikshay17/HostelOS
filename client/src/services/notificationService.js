import api from './api';

const authHeader = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

export const getMyNotifications = (token) => api.get('/notifications', authHeader(token));
export const getUnreadCount = (token) => api.get('/notifications/unread-count', authHeader(token));
export const markAsRead = (id, token) => api.patch(`/notifications/${id}/read`, {}, authHeader(token));
export const markAllAsRead = (token) => api.patch('/notifications/read-all', {}, authHeader(token));
export const deleteNotification = (id, token) => api.delete(`/notifications/${id}`, authHeader(token));
export const broadcastNotification = (data, token) => api.post('/notifications/broadcast', data, authHeader(token));