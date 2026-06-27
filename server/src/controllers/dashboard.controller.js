const User = require('../models/User.model');
const Room = require('../models/Room.model');
const Booking = require('../models/Booking.model');
const Complaint = require('../models/Complaint.model');
const GatePass = require('../models/GatePass.model');
const MessBill = require('../models/MessBill.model');

// Student dashboard summary
exports.getStudentSummary = async (req, res) => {
  try {
    const studentId = req.user.id;

    const activeBooking = await Booking.findOne({ student: studentId, status: 'approved' }).populate('room');
    const pendingGatePasses = await GatePass.countDocuments({ student: studentId, status: 'pending' });
    const unpaidBills = await MessBill.countDocuments({ student: studentId, status: { $in: ['unpaid', 'overdue'] } });
    const openComplaints = await Complaint.countDocuments({ student: studentId, status: { $ne: 'resolved' } });

    res.json({
      activeBooking,
      pendingGatePasses,
      unpaidBills,
      openComplaints
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Warden dashboard summary
exports.getWardenSummary = async (req, res) => {
  try {
    const pendingBookings = await Booking.countDocuments({ status: 'pending' });
    const pendingGatePasses = await GatePass.countDocuments({ status: 'pending' });
    const openComplaints = await Complaint.countDocuments({ status: 'open' });
    const totalStudents = await User.countDocuments({ role: 'student' });

    res.json({
      pendingBookings,
      pendingGatePasses,
      openComplaints,
      totalStudents
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin dashboard summary
exports.getAdminSummary = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalWardens = await User.countDocuments({ role: 'warden' });
    const totalRooms = await Room.countDocuments();
    const occupiedRooms = await Room.countDocuments({ status: 'full' });
    const totalUnpaidBills = await MessBill.countDocuments({ status: { $in: ['unpaid', 'overdue'] } });
    const openComplaints = await Complaint.countDocuments({ status: { $ne: 'resolved' } });

    res.json({
      totalStudents,
      totalWardens,
      totalRooms,
      occupiedRooms,
      totalUnpaidBills,
      openComplaints
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};