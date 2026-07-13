const asyncHandler = require('../utils/asyncHandler');
const Settings = require('../models/Settings');
const AuditLog = require('../models/AuditLog');
const logAudit = require('../utils/logAudit');

// @route GET /api/settings
const getSettings = asyncHandler(async (req, res) => {
  const settings = await Settings.getSingleton();
  res.json({ success: true, data: settings });
});

// @route PUT /api/settings
// @access  Private/Admin
const updateSettings = asyncHandler(async (req, res) => {
  const settings = await Settings.getSingleton();
  Object.assign(settings, req.body);
  await settings.save();

  await logAudit({ user: req.user, action: 'UPDATE_SETTINGS', entity: 'Settings', entityId: settings._id, req });
  res.json({ success: true, data: settings });
});

// @route GET /api/settings/audit-logs
// @access  Private/Admin
const getAuditLogs = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 50;

  const [logs, total] = await Promise.all([
    AuditLog.find()
      .populate('user', 'name email role')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(limit),
    AuditLog.countDocuments(),
  ]);

  res.json({ success: true, count: logs.length, total, page, pages: Math.ceil(total / limit), data: logs });
});

module.exports = { getSettings, updateSettings, getAuditLogs };
