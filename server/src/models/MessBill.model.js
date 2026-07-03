const mongoose = require('mongoose');

const messBillSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  month: { type: String, required: true },
  amount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['unpaid', 'pending_verification', 'paid', 'overdue'],
    default: 'unpaid'
  },
  dueDate: { type: Date, required: true },
  paidAt: { type: Date },

  // Payment proof fields
  transactionId: { type: String },
  paymentMethod: {
    type: String,
    enum: ['upi', 'netbanking', 'card', 'cash', 'other'],
  },
  paymentNote: { type: String },

  // Admin verification
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  verifiedAt: { type: Date },
  rejectionReason: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('MessBill', messBillSchema);