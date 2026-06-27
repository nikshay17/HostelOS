const mongoose = require('mongoose');

const messBillSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  month: { type: String, required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['unpaid', 'paid', 'overdue'], default: 'unpaid' },
  paidAt: { type: Date },
  dueDate: { type: Date, required: true },
}, { timestamps: true });

module.exports = mongoose.model('MessBill', messBillSchema);