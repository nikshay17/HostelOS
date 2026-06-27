const mongoose = require('mongoose');

const gatePassSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reason: { type: String, required: true },
  outTime: { type: Date },
  expectedReturnTime: { type: Date },
  actualReturnTime: { type: Date },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'completed'], default: 'pending' },
  qrCode: { type: String },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('GatePass', gatePassSchema);