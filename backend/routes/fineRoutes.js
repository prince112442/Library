const express = require('express');
const { getFines, payFine, waiveFine } = require('../controllers/fineController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', getFines);
router.patch('/:id/pay', authorize('admin', 'librarian'), payFine);
router.patch('/:id/waive', authorize('admin'), waiveFine);

module.exports = router;
