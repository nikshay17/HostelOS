const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');
const {
  getMyNotifications, getUnreadCount, markAsRead,
  markAllAsRead, deleteNotification, broadcastNotification
} = require('../controllers/notification.controller');

router.get('/', protect, getMyNotifications);
router.get('/unread-count', protect, getUnreadCount);
router.patch('/read-all', protect, markAllAsRead);
router.post('/broadcast', protect, authorize('warden', 'admin'), broadcastNotification);

router.patch('/:id/read', protect, markAsRead);
router.delete('/:id', protect, deleteNotification);

module.exports = router;