const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');
const {
  createGatePass, getMyGatePasses, getPendingGatePasses,
  approveGatePass, rejectGatePass, verifyGatePass
} = require('../controllers/gatepass.controller');

// Static paths before /:id wildcard routes
router.post('/', protect, authorize('student'), createGatePass);
router.get('/mine', protect, authorize('student'), getMyGatePasses);
router.get('/pending', protect, authorize('warden', 'admin'), getPendingGatePasses);
router.post('/verify', protect, authorize('warden', 'admin'), verifyGatePass);

router.patch('/:id/approve', protect, authorize('warden', 'admin'), approveGatePass);
router.patch('/:id/reject', protect, authorize('warden', 'admin'), rejectGatePass);

module.exports = router;