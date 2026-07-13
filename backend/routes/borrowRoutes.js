const express = require('express');
const { body } = require('express-validator');
const { borrowBook, returnBook, getBorrowRecords, markOverdue } = require('../controllers/borrowController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(protect);

router.get('/', getBorrowRecords);

router.post(
  '/',
  authorize('admin', 'librarian'),
  [body('bookId').notEmpty().withMessage('bookId is required'), body('studentId').notEmpty().withMessage('studentId is required')],
  validate,
  borrowBook
);

router.post('/:id/return', authorize('admin', 'librarian'), returnBook);
router.post('/mark-overdue', authorize('admin', 'librarian'), markOverdue);

module.exports = router;
