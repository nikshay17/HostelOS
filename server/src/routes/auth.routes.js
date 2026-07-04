const express = require('express');
const router = express.Router();
const {
  register, login, getMe, createStaff, verifyOTP, resendOTP
} = require('../controllers/auth.controller');
const protect = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');
const {
  registerValidation, loginValidation, createStaffValidation
} = require('../middleware/validators/auth.validators');
const validate = require('../middleware/validate.middleware');
const { authLimiter } = require('../middleware/rateLimiter.middleware');

router.post('/register', authLimiter, registerValidation, validate, register);
router.post('/login', authLimiter, loginValidation, validate, login);
router.post('/verify-otp', verifyOTP);   // no rate limit on verify (only 6-digit guessing, TTL handles abuse)
router.post('/resend-otp', resendOTP);
router.get('/me', protect, getMe);
router.post('/create-staff', protect, authorize('admin'), createStaffValidation, validate, createStaff);

module.exports = router;