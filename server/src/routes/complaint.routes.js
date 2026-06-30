const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');
const {
  createComplaint, getMyComplaints, getAllComplaints,
  updateComplaintStatus, deleteComplaint
} = require('../controllers/complaint.controller');

router.post('/', protect, authorize('student'), createComplaint);
router.get('/mine', protect, authorize('student'), getMyComplaints);
router.get('/', protect, authorize('warden', 'admin'), getAllComplaints);
router.delete('/:id', protect, authorize('student'), deleteComplaint);
router.patch('/:id/status', protect, authorize('warden', 'admin'), updateComplaintStatus);

module.exports = router;