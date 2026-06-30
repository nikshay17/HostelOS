const AuditLog = require('../models/AuditLog.model');

exports.getAuditLogs = async (req, res) => {
  try {
    const { action, actorRole } = req.query;
    const filter = {};
    if (action) filter.action = action;
    if (actorRole) filter.actorRole = actorRole;

    const logs = await AuditLog.find(filter)
      .populate('actor', 'name email role')
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};