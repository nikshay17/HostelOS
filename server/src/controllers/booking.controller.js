const Booking = require('../models/Booking.model');
const Room = require('../models/Room.model');
const User = require('../models/User.model');

// Student requests a booking
exports.createBooking = async (req, res) => {
  try {
    const { roomId } = req.body;
    const studentId = req.user.id;

    // Block duplicate active requests
    const existingActive = await Booking.findOne({
      student: studentId,
      status: { $in: ['pending', 'approved'] }
    });
    if (existingActive) {
      return res.status(400).json({ message: 'You already have an active or pending booking' });
    }

    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    if (room.status === 'full' || room.occupants.length >= room.capacity) {
      return res.status(400).json({ message: 'Room is full' });
    }
    if (room.status === 'maintenance') {
      return res.status(400).json({ message: 'Room is under maintenance' });
    }

    const booking = await Booking.create({ student: studentId, room: roomId, status: 'pending' });
    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Student views their own bookings
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ student: req.user.id })
      .populate('room', 'roomNumber floor type')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Student cancels their own pending booking
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.student.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not your booking' });
    }
    if (booking.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending bookings can be cancelled' });
    }
    booking.status = 'cancelled';
    await booking.save();
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Warden/Admin: view all pending bookings
exports.getPendingBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ status: 'pending' })
      .populate('student', 'name email studentId')
      .populate('room', 'roomNumber floor type capacity')
      .sort({ createdAt: 1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Warden/Admin: approve a booking
exports.approveBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('room');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.status !== 'pending') {
      return res.status(400).json({ message: 'Booking already processed' });
    }

    const room = booking.room;
    if (room.occupants.length >= room.capacity) {
      return res.status(400).json({ message: 'Room became full while this booking was pending' });
    }

    room.occupants.push(booking.student);
    if (room.occupants.length >= room.capacity) room.status = 'full';
    await room.save();

    booking.status = 'approved';
    booking.approvedBy = req.user.id;
    await booking.save();

    // Denormalized convenience field on User
    await User.findByIdAndUpdate(booking.student, { roomNumber: room.roomNumber });

    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Warden/Admin: reject a booking
exports.rejectBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.status !== 'pending') {
      return res.status(400).json({ message: 'Booking already processed' });
    }
    booking.status = 'rejected';
    booking.approvedBy = req.user.id;
    await booking.save();
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};