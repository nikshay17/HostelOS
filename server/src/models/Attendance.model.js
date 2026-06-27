const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now },
  status: { type: String, enum: ['present', 'absent', 'late'], default: 'present' },
  location: {
    latitude: Number,
    longitude: Number,
  },
  verifiedByFace: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Attendance', attendanceSchema);