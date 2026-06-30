const Notification = require('../models/Notification.model');

const sendNotification = async ({ recipient, title, message, type = 'info' }) => {
  try {
    await Notification.create({ recipient, title, message, type });
  } catch (err) {
    console.error('Failed to create notification:', err.message);
    // Deliberately non-throwing — a notification failure shouldn't break the main request
  }
};

module.exports = sendNotification;