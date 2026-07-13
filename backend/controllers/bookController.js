const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const Book = require('../models/Book');
const ApiFeatures = require('../utils/apiFeatures');
const logAudit = require('../utils/logAudit');
const { cloudinary } = require('../config/cloudinary');

// @desc    List books with search/filter/sort/pagination
// @route   GET /api/books
// @access  Private
const getBooks = asyncHandler(async (req, res) => {
  const baseQuery = Book.find().populate('category', 'name');

  const features = new ApiFeatures(baseQuery, req.query)
    .filter()
    .search(['title', 'author', 'isbn'])
    .sort()
    .limitFields()
    .paginate();

  const [books, total] = await Promise.all([
    features.query,
    Book.countDocuments(),
  ]);

  res.json({
    success: true,
    count: books.length,
    total,
    page: features.pagination.page,
    pages: Math.ceil(total / features.pagination.limit),
    data: books,
  });
});

// @route GET /api/books/:id
const getBook = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id).populate('category', 'name');
  if (!book) throw new ApiError(404, 'Book not found');
  res.json({ success: true, data: book });
});

// @route POST /api/books  (multipart/form-data if a cover image is included)
const createBook = asyncHandler(async (req, res) => {
  const bookData = { ...req.body, addedBy: req.user._id };

  // availableQuantity starts equal to quantity for a newly added book
  bookData.availableQuantity = bookData.quantity;

  if (req.file) {
    bookData.coverImage = { url: req.file.path, publicId: req.file.filename };
  }

  const book = await Book.create(bookData);
  await logAudit({ user: req.user, action: 'CREATE_BOOK', entity: 'Book', entityId: book._id, req });

  res.status(201).json({ success: true, data: book });
});

// @route PUT /api/books/:id
const updateBook = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) throw new ApiError(404, 'Book not found');

  const updates = { ...req.body };

  // If quantity is being changed, adjust availableQuantity by the same delta
  // so currently-borrowed copies remain accounted for correctly.
  if (updates.quantity !== undefined) {
    const delta = Number(updates.quantity) - book.quantity;
    updates.availableQuantity = Math.max(0, book.availableQuantity + delta);
  }

  if (req.file) {
    // Remove old cover from Cloudinary before replacing it
    if (book.coverImage?.publicId) {
      await cloudinary.uploader.destroy(book.coverImage.publicId).catch(() => {});
    }
    updates.coverImage = { url: req.file.path, publicId: req.file.filename };
  }

  Object.assign(book, updates);
  await book.save();

  await logAudit({ user: req.user, action: 'UPDATE_BOOK', entity: 'Book', entityId: book._id, req });
  res.json({ success: true, data: book });
});

// @route DELETE /api/books/:id
const deleteBook = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) throw new ApiError(404, 'Book not found');

  if (book.availableQuantity < book.quantity) {
    throw new ApiError(400, 'Cannot delete: some copies of this book are currently borrowed');
  }

  if (book.coverImage?.publicId) {
    await cloudinary.uploader.destroy(book.coverImage.publicId).catch(() => {});
  }

  await book.deleteOne();
  await logAudit({ user: req.user, action: 'DELETE_BOOK', entity: 'Book', entityId: req.params.id, req });

  res.json({ success: true, message: 'Book deleted' });
});

module.exports = { getBooks, getBook, createBook, updateBook, deleteBook };
