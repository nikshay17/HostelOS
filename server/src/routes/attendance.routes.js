const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');
const {
  markAttendance, getMyAttendance, getTodayAttendance,
  getStudentAttendance, markAbsent
} = require('../controllers/attendance.controller');

router.post('/', protect, authorize('student'), markAttendance);
router.get('/mine', protect, authorize('student'), getMyAttendance);
router.get('/today', protect, authorize('warden', 'admin'), getTodayAttendance);
router.post('/mark-absent', protect, authorize('warden', 'admin'), markAbsent);
router.get('/student/:studentId', protect, authorize('warden', 'admin'), getStudentAttendance);

module.exports = router;