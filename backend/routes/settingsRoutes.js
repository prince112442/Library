const express = require('express');
const { getSettings, updateSettings, getAuditLogs } = require('../controllers/settingsController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/').get(getSettings).put(authorize('admin'), updateSettings);
router.get('/audit-logs', authorize('admin'), getAuditLogs);

module.exports = router;
