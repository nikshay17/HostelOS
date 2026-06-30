const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');
const { getAuditLogs } = require('../controllers/security.controller');

router.get('/audit-logs', protect, authorize('admin'), getAuditLogs);

module.exports = router;