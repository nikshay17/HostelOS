const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');
const {
  getOccupancyStats, getComplaintStats, getMessBillStats,
  getAttendanceTrend, getGatePassStats, getFullAnalytics
} = require('../controllers/analytics.controller');

router.get('/occupancy', protect, authorize('warden', 'admin'), getOccupancyStats);
router.get('/complaints', protect, authorize('warden', 'admin'), getComplaintStats);
router.get('/messbills', protect, authorize('warden', 'admin'), getMessBillStats);
router.get('/attendance-trend', protect, authorize('warden', 'admin'), getAttendanceTrend);
router.get('/gatepasses', protect, authorize('warden', 'admin'), getGatePassStats);
router.get('/full', protect, authorize('warden', 'admin'), getFullAnalytics);

module.exports = router;