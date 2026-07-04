const mongoose = require('mongoose');

const pendingRegistrationSchema = new mongoose.Schema({
  name:          { type: String, required: true },
  email:         { type: String, required: true, unique: true },
  password:      { type: String, required: true }, // already bcrypt hashed
  studentId:     { type: String, required: true },
  roomNumber:    { type: String, default: '' },
  phone:         { type: String, default: '' },

  otp:           { type: String, required: true },
  otpExpiry:     { type: Date, required: true },

  // Auto-delete after 15 minutes whether or not OTP was verified
  createdAt:     { type: Date, default: Date.now, expires: 900 }
  // ↑ TTL index: MongoDB auto-deletes this document 15 minutes after creation
}, { timestamps: false });

module.exports = mongoose.model('PendingRegistration', pendingRegistrationSchema);