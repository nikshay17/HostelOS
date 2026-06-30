const express = require('express');
const router = express.Router();
const { register, login, getMe, createStaff } = require('../controllers/auth.controller');
const protect = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');
const { registerValidation, loginValidation, createStaffValidation } = require('../middleware/validators/auth.validators');
const validate = require('../middleware/validate.middleware');
const { authLimiter } = require('../middleware/rateLimiter.middleware');

router.post('/register', register);           // students only
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/create-staff', protect, authorize('admin'), createStaff); // admin only

router.post('/register', registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);
router.post('/create-staff', protect, authorize('admin'), createStaffValidation, validate, createStaff);

router.post('/register', authLimiter, registerValidation, validate, register);
router.post('/login', authLimiter, loginValidation, validate, login);

module.exports = router;