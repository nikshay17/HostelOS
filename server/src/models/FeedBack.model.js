const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, enum: ['mess', 'facilities', 'staff', 'general'], required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comments: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Feedback', feedbackSchema);