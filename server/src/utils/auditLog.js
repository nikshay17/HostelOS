const AuditLog = require('../models/AuditLog.model');
const logger = require('./logger');

const recordAudit = async ({ req, action, targetType, targetId, details = {} }) => {
  try {
    await AuditLog.create({
      actor: req.user.id,
      actorRole: req.user.role,
      action,
      targetType,
      targetId,
      details,
      ipAddress: req.ip
    });
    logger.info(`AUDIT: ${action} by ${req.user.role}:${req.user.id}`, { targetType, targetId });
  } catch (err) {
    logger.error('Failed to write audit log', { error: err.message });
    // Non-throwing — same philosophy as sendNotification, audit failure shouldn't break the request
  }
};

module.exports = recordAudit;