const express = require('express');
const { body } = require('express-validator');
const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getCategories)
  .post(
    authorize('admin', 'librarian'),
    [body('name').trim().notEmpty().withMessage('Category name is required')],
    validate,
    createCategory
  );

router
  .route('/:id')
  .put(authorize('admin', 'librarian'), updateCategory)
  .delete(authorize('admin'), deleteCategory);

module.exports = router;
