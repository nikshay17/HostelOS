const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  actorRole: { type: String, required: true },
  action: { type: String, required: true }, // e.g. "APPROVE_BOOKING", "CREATE_STAFF", "DELETE_ROOM"
  targetType: { type: String }, // e.g. "Booking", "User", "Room"
  targetId: { type: mongoose.Schema.Types.ObjectId },
  details: { type: mongoose.Schema.Types.Mixed }, // flexible extra context
  ipAddress: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditLogSchema);