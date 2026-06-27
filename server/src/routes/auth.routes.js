const express = require('express');
const router = express.Router();
const { register, login, getMe, createStaff } = require('../controllers/auth.controller');
const protect = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');

router.post('/register', register);           // students only
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/create-staff', protect, authorize('admin'), createStaff); // admin only

module.exports = router;