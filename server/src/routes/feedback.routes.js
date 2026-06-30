const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');
const {
  createFeedback, getMyFeedback, getAllFeedback, getFeedbackSummary
} = require('../controllers/feedback.controller');

router.post('/', protect, authorize('student'), createFeedback);
router.get('/mine', protect, authorize('student'), getMyFeedback);
router.get('/summary', protect, authorize('warden', 'admin'), getFeedbackSummary);
router.get('/', protect, authorize('warden', 'admin'), getAllFeedback);

module.exports = router;