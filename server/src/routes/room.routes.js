const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');
const {
  getAllRooms, getRoomById, createRoom, updateRoom, deleteRoom, removeStudentFromRoom, assignStudentToRoom
} = require('../controllers/room.controller');
const {
  createBooking, getMyBookings, cancelBooking,
  getPendingBookings, approveBooking, rejectBooking
} = require('../controllers/booking.controller');

// Rooms — static paths first
router.get('/', protect, getAllRooms);
router.post('/', protect, authorize('warden', 'admin'), createRoom);

// Bookings — also static paths, declared before /:id
router.post('/bookings', protect, authorize('student'), createBooking);
router.get('/bookings/mine', protect, authorize('student'), getMyBookings);
router.patch('/bookings/:id/cancel', protect, authorize('student'), cancelBooking);
router.get('/bookings/pending', protect, authorize('warden', 'admin'), getPendingBookings);
router.patch('/bookings/:id/approve', protect, authorize('warden', 'admin'), approveBooking);
router.patch('/bookings/:id/reject', protect, authorize('warden', 'admin'), rejectBooking);

// Room wildcard routes — last
router.get('/:id', protect, getRoomById);
router.put('/:id', protect, authorize('warden', 'admin'), updateRoom);
router.delete('/:id', protect, authorize('admin'), deleteRoom);

module.exports = router;