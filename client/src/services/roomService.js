import api from './api';

const authHeader = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

export const getAllRooms = (token) => api.get('/rooms', authHeader(token));
export const getAvailableStudents = (token) => api.get('/rooms/available-students', authHeader(token));
export const requestBooking = (roomId, token) =>
  api.post('/rooms/bookings', { roomId }, authHeader(token));
export const getMyBookings = (token) => api.get('/rooms/bookings/mine', authHeader(token));
export const cancelBooking = (bookingId, token) =>
  api.patch(`/rooms/bookings/${bookingId}/cancel`, {}, authHeader(token));
export const removeStudentFromRoom = (roomId, studentId, token) =>
  api.patch(`/rooms/${roomId}/remove-student`, { studentId }, authHeader(token));

export const assignStudentToRoom = (roomId, studentId, token) =>
  api.patch(`/rooms/${roomId}/assign-student`, { studentId }, authHeader(token));

//DAY 4
export const createRoom = (data, token) => api.post('/rooms', data, authHeader(token));
export const updateRoom = (id, data, token) => api.put(`/rooms/${id}`, data, authHeader(token));
export const deleteRoom = (id, token) => api.delete(`/rooms/${id}`, authHeader(token));
export const getPendingBookings = (token) => api.get('/rooms/bookings/pending', authHeader(token));
export const approveBooking = (id, token) => api.patch(`/rooms/bookings/${id}/approve`, {}, authHeader(token));
export const rejectBooking = (id, token) => api.patch(`/rooms/bookings/${id}/reject`, {}, authHeader(token));