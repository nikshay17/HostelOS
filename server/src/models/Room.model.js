const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomNumber: { type: String, required: true, unique: true },
  capacity: { type: Number, required: true },
  occupants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  floor: { type: Number },
  type: { type: String, enum: ['single', 'double', 'triple'], default: 'double' },
  status: { type: String, enum: ['available', 'full', 'maintenance'], default: 'available' },
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);