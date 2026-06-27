const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'warden', 'admin'], default: 'student' },

  // Student-only fields
  studentId: { type: String, unique: true, sparse: true },
  roomNumber: { type: String },

  // Staff-only fields (warden + admin)
  employeeId: { type: String, unique: true, sparse: true },
  designation: { type: String }, // e.g. "Hostel Warden", "Dean of Student Affairs"
  department: { type: String },

  phone: { type: String },
  faceEncoded: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // who created this staff account
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);