const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');
const { enrollFace, verifyFace, getEnrollmentStatus } = require('../controllers/faceAuth.controller');

router.post('/enroll', protect, authorize('student'), enrollFace);
router.post('/verify', protect, authorize('student'), verifyFace);
router.get('/status', protect, authorize('student'), getEnrollmentStatus);

module.exports = router;