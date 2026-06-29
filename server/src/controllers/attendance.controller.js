const Attendance = require('../models/Attendance.model');
const { isWithinHostelRadius } = require('../utils/geoUtils');

// Student marks attendance for today
exports.markAttendance = async (req, res) => {
  try {
    const { latitude, longitude, faceVerified } = req.body;
    const studentId = req.user.id;

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({ message: 'latitude and longitude are required' });
    }

    // Block duplicate attendance for the same day
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const existing = await Attendance.findOne({
      student: studentId,
      date: { $gte: startOfDay, $lte: endOfDay }
    });
    if (existing) {
      return res.status(400).json({ message: 'Attendance already marked for today' });
    }

    const { withinRadius, distance } = isWithinHostelRadius(latitude, longitude);
    if (!withinRadius) {
      return res.status(400).json({
        message: `You are too far from the hostel to check in (${Math.round(distance)}m away)`
      });
    }

    const attendance = await Attendance.create({
      student: studentId,
      date: new Date(),
      status: 'present',
      location: { latitude, longitude },
      verifiedByFace: !!faceVerified  // changed from hardcoded false
    });

    res.status(201).json(attendance);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Student views their own attendance history
exports.getMyAttendance = async (req, res) => {
  try {
    const records = await Attendance.find({ student: req.user.id }).sort({ date: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Warden/Admin: view today's attendance for all students
exports.getTodayAttendance = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const records = await Attendance.find({ date: { $gte: startOfDay, $lte: endOfDay } })
      .populate('student', 'name studentId roomNumber')
      .sort({ date: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Warden/Admin: view attendance for a specific student (by ID, with optional date range)
exports.getStudentAttendance = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { from, to } = req.query;

    const filter = { student: studentId };
    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = new Date(from);
      if (to) filter.date.$lte = new Date(to);
    }

    const records = await Attendance.find(filter).sort({ date: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Warden/Admin: manually mark a student absent (e.g. didn't check in by EOD)
exports.markAbsent = async (req, res) => {
  try {
    const { studentId } = req.body;
    if (!studentId) return res.status(400).json({ message: 'studentId is required' });

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const existing = await Attendance.findOne({
      student: studentId,
      date: { $gte: startOfDay, $lte: endOfDay }
    });
    if (existing) {
      return res.status(400).json({ message: 'Attendance already recorded for today' });
    }

    const record = await Attendance.create({
      student: studentId,
      date: new Date(),
      status: 'absent'
    });

    res.status(201).json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};