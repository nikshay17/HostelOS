const express = require('express');
const router = express.Router();
const { getStudentSummary, getWardenSummary, getAdminSummary } = require('../controllers/dashboard.controller');
const protect = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');

router.get('/student', protect, authorize('student'), getStudentSummary);
router.get('/warden', protect, authorize('warden'), getWardenSummary);
router.get('/admin', protect, authorize('admin'), getAdminSummary);

module.exports = router;