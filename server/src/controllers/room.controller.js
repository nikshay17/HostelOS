const Room = require('../models/Room.model');
const Booking = require('../models/Booking.model');
const User = require('../models/User.model');

// Get available students for assignment (not already in a room)
exports.getAvailableStudents = async (req, res) => {
  try {
    // A profile field must not determine room availability. A student is
    // unavailable only after an actual room allocation or approved booking.
    const [approvedBookingStudentIds, assignedOccupantIds] = await Promise.all([
      Booking.distinct('student', { status: 'approved' }),
      Room.distinct('occupants')
    ]);
    const assignedStudentIds = [...new Set([
      ...approvedBookingStudentIds.map(String),
      ...assignedOccupantIds.map(String)
    ])];

    const students = await User.find({
      role: 'student',
      _id: { $nin: assignedStudentIds }
    }, 'name studentId email').sort({ name: 1 });
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// List all rooms (everyone can view)
exports.getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find().populate('occupants', 'name email studenId');
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get a single room
exports.getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id).populate('occupants', 'name email');
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.json(room);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create a room (warden/admin only)
exports.createRoom = async (req, res) => {
  try {
    const { roomNumber, capacity, floor, type } = req.body;

    const existing = await Room.findOne({ roomNumber });
    if (existing) return res.status(400).json({ message: 'Room number already exists' });

    const room = await Room.create({ roomNumber, capacity, floor, type, status: 'available' });
    res.status(201).json(room);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update room (warden/admin only)
exports.updateRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.json(room);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete room (admin only)
exports.deleteRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    if (room.occupants.length > 0) {
      return res.status(400).json({ message: 'Cannot delete a room with active occupants' });
    }
    await Room.findByIdAndDelete(req.params.id);

    const recordAudit = require('../utils/auditLog');

    await recordAudit({
      req,
      action: 'DELETE_ROOM',
      targetType: 'Room',
      targetId: room._id,
      details: { roomNumber: room.roomNumber }
    });
    
    res.json({ message: 'Room deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.removeStudentFromRoom = async (req, res) => {
  try {
    const { studentId } = req.body;
    if (!studentId) return res.status(400).json({ message: 'studentId is required' });

    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });

    const wasOccupied = room.occupants.some(o => o.toString() === studentId);
    if (!wasOccupied) {
      return res.status(400).json({ message: 'Student is not in this room' });
    }

    // Remove student from room occupants
    room.occupants = room.occupants.filter(o => o.toString() !== studentId);

    // Update room status back to available if it was full
    if (room.status === 'full') room.status = 'available';

    await room.save();

    // Clear roomNumber from the student's user document
    await User.findByIdAndUpdate(studentId, { roomNumber: '' });

    // Cancel any approved booking for this student+room combo
    await Booking.findOneAndUpdate(
      { student: studentId, room: req.params.id, status: 'approved' },
      { status: 'cancelled' }
    );

    // Notify the student
    const sendNotification = require('../utils/sendNotification');
    await sendNotification({
      recipient: studentId,
      title: 'Room Allocation Removed',
      message: `You have been removed from room ${room.roomNumber}. You may request a new room from the booking section.`,
      type: 'warning'
    });

    const updatedRoom = await Room.findById(req.params.id).populate('occupants', 'name email studentId');
    res.json({ message: `Student removed from room ${room.roomNumber}`, room: updatedRoom });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Manually assign a student to a room (admin override — no booking request needed)
exports.assignStudentToRoom = async (req, res) => {
  try {
    const { studentId } = req.body;
    if (!studentId) return res.status(400).json({ message: 'studentId is required' });

    const room = await Room.findById(req.params.id).populate('occupants', 'name');
    if (!room) return res.status(404).json({ message: 'Room not found' });

    if (room.status === 'maintenance') {
      return res.status(400).json({ message: 'Cannot assign student to a room under maintenance' });
    }

    if (room.occupants.length >= room.capacity) {
      return res.status(400).json({ message: 'Room is already at full capacity' });
    }

    const alreadyInRoom = room.occupants.some(o => o._id.toString() === studentId);
    if (alreadyInRoom) {
      return res.status(400).json({ message: 'Student is already in this room' });
    }

    // Check student exists and is actually a student
    const student = await User.findById(studentId);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    if (student.role !== 'student') {
      return res.status(400).json({ message: 'Can only assign students to rooms' });
    }

    // Check student doesn't already have a room
    const existingBooking = await Booking.findOne({
      student: studentId,
      status: 'approved'
    });
    if (existingBooking) {
      return res.status(400).json({ message: 'Student already has an approved room booking. Remove them from their current room first.' });
    }

    // Assign to room
    room.occupants.push(studentId);
    if (room.occupants.length >= room.capacity) room.status = 'full';
    await room.save();

    // Update student's roomNumber
    await User.findByIdAndUpdate(studentId, { roomNumber: room.roomNumber });

    // Create an approved booking record for audit trail
    await Booking.create({
      student: studentId,
      room: req.params.id,
      status: 'approved',
      approvedBy: req.user.id,
      requestedAt: new Date()
    });

    // Notify the student
    const sendNotification = require('../utils/sendNotification');
    await sendNotification({
      recipient: studentId,
      title: 'Room Assigned',
      message: `You have been assigned to room ${room.roomNumber} by the admin.`,
      type: 'info'
    });

    const updatedRoom = await Room.findById(req.params.id).populate('occupants', 'name email studentId');
    res.json({ message: `Student assigned to room ${room.roomNumber}`, room: updatedRoom });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
