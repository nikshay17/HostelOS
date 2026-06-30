const Room = require('../models/Room.model');
const Booking = require('../models/Booking.model');

// List all rooms (everyone can view)
exports.getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find().populate('occupants', 'name email roomNumber');
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