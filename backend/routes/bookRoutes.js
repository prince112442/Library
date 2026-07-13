const express = require('express');
const { body } = require('express-validator');
const {
  getBooks,
  getBook,
  createBook,
  updateBook,
  deleteBook,
} = require('../controllers/bookController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const upload = require('../middleware/upload');

const router = express.Router();

router.use(protect); // all book routes require login

const bookValidation = [
  body('isbn').trim().notEmpty().withMessage('ISBN is required'),
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('author').trim().notEmpty().withMessage('Author is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('quantity').isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer'),
];

router
  .route('/')
  .get(getBooks)
  .post(authorize('admin', 'librarian'), upload.single('coverImage'), bookValidation, validate, createBook);

router
  .route('/:id')
  .get(getBook)
  .put(authorize('admin', 'librarian'), upload.single('coverImage'), updateBook)
  .delete(authorize('admin', 'librarian'), deleteBook);

module.exports = router;
