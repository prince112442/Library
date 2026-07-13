const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const Category = require('../models/Category');
const Book = require('../models/Book');
const logAudit = require('../utils/logAudit');

// @route GET /api/categories
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort('name');
  res.json({ success: true, count: categories.length, data: categories });
});

// @route POST /api/categories
const createCategory = asyncHandler(async (req, res) => {
  const category = await Category.create(req.body);
  await logAudit({ user: req.user, action: 'CREATE_CATEGORY', entity: 'Category', entityId: category._id, req });
  res.status(201).json({ success: true, data: category });
});

// @route PUT /api/categories/:id
const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!category) throw new ApiError(404, 'Category not found');
  await logAudit({ user: req.user, action: 'UPDATE_CATEGORY', entity: 'Category', entityId: category._id, req });
  res.json({ success: true, data: category });
});

// @route DELETE /api/categories/:id
const deleteCategory = asyncHandler(async (req, res) => {
  const inUse = await Book.countDocuments({ category: req.params.id });
  if (inUse > 0) {
    throw new ApiError(400, `Cannot delete: ${inUse} book(s) still use this category`);
  }
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) throw new ApiError(404, 'Category not found');
  await logAudit({ user: req.user, action: 'DELETE_CATEGORY', entity: 'Category', entityId: req.params.id, req });
  res.json({ success: true, message: 'Category deleted' });
});

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };
