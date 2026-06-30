const User = require('../models/User.model');
const Room = require('../models/Room.model');
const Booking = require('../models/Booking.model');
const GatePass = require('../models/GatePass.model');
const Attendance = require('../models/Attendance.model');
const Complaint = require('../models/Complaint.model');
const Feedback = require('../models/Feedback.model');
const MessBill = require('../models/MessBill.model');

// Occupancy breakdown — rooms by status, and capacity utilization
exports.getOccupancyStats = async (req, res) => {
  try {
    const byStatus = await Room.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const capacityStats = await Room.aggregate([
      {
        $project: {
          roomNumber: 1,
          capacity: 1,
          occupied: { $size: '$occupants' }
        }
      },
      {
        $group: {
          _id: null,
          totalCapacity: { $sum: '$capacity' },
          totalOccupied: { $sum: '$occupied' }
        }
      }
    ]);

    const byType = await Room.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 }, totalCapacity: { $sum: '$capacity' } } }
    ]);

    res.json({
      byStatus,
      byType,
      utilization: capacityStats[0] || { totalCapacity: 0, totalOccupied: 0 }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Complaints breakdown — by category and by status
exports.getComplaintStats = async (req, res) => {
  try {
    const byCategory = await Complaint.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const byStatus = await Complaint.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Average resolution time in hours, for resolved complaints
    const resolutionTime = await Complaint.aggregate([
      { $match: { status: 'resolved' } },
      {
        $project: {
          hoursToResolve: {
            $divide: [{ $subtract: ['$updatedAt', '$createdAt'] }, 1000 * 60 * 60]
          }
        }
      },
      { $group: { _id: null, avgHours: { $avg: '$hoursToResolve' } } }
    ]);

    res.json({
      byCategory,
      byStatus,
      avgResolutionHours: resolutionTime[0]?.avgHours || 0
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Mess bill financial stats — collected vs outstanding, by month
exports.getMessBillStats = async (req, res) => {
  try {
    const byMonth = await MessBill.aggregate([
      {
        $group: {
          _id: '$month',
          totalBilled: { $sum: '$amount' },
          totalCollected: {
            $sum: { $cond: [{ $eq: ['$status', 'paid'] }, '$amount', 0] }
          },
          totalOutstanding: {
            $sum: { $cond: [{ $ne: ['$status', 'paid'] }, '$amount', 0] }
          },
          billCount: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const byStatus = await MessBill.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 }, amount: { $sum: '$amount' } } }
    ]);

    res.json({ byMonth, byStatus });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Attendance trend — present/absent/late counts over the last 7 days
exports.getAttendanceTrend = async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const trend = await Attendance.aggregate([
      { $match: { date: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
            status: '$status'
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.date': 1 } }
    ]);

    res.json({ trend });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Gate pass stats — by status
exports.getGatePassStats = async (req, res) => {
  try {
    const byStatus = await GatePass.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    res.json({ byStatus });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// One combined endpoint — everything the analytics dashboard needs in a single call
exports.getFullAnalytics = async (req, res) => {
  try {
    const [occupancy, complaints, bills, attendance, gatepasses, totalStudents, totalWardens] = await Promise.all([
      Room.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Complaint.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]),
      MessBill.aggregate([{ $group: { _id: '$status', count: { $sum: 1 }, amount: { $sum: '$amount' } } }]),
      Attendance.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      GatePass.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'warden' })
    ]);

    res.json({
      occupancy,
      complaints,
      bills,
      attendance,
      gatepasses,
      totalStudents,
      totalWardens
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};