const express = require('express');
const { exportReport } = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/:type', protect, authorize('admin', 'librarian'), exportReport);

module.exports = router;
