const AuditLog = require('../models/AuditLog');

/**
 * Records an audit trail entry. Fails silently (logs to console only) so
 * that logging issues never interrupt the primary request.
 */
const logAudit = async ({ user, action, entity, entityId, details, req }) => {
  try {
    await AuditLog.create({
      user: user?._id,
      action,
      entity,
      entityId,
      details,
      ipAddress: req?.ip,
    });
  } catch (error) {
    console.error(`Audit log failed: ${error.message}`);
  }
};

module.exports = logAudit;
