const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const Book = require('../models/Book');
const Reservation = require('../models/Reservation');
const logAudit = require('../utils/logAudit');

// @desc    Student reserves a book (typically when all copies are out)
// @route   POST /api/reservations
// @access  Private/Student
const createReservation = asyncHandler(async (req, res) => {
  const { bookId } = req.body;
  const book = await Book.findById(bookId);
  if (!book) throw new ApiError(404, 'Book not found');

  const existing = await Reservation.findOne({ book: bookId, student: req.user._id, status: 'pending' });
  if (existing) throw new ApiError(400, 'You already have a pending reservation for this book');

  const reservation = await Reservation.create({ book: bookId, student: req.user._id });
  await logAudit({ user: req.user, action: 'CREATE_RESERVATION', entity: 'Reservation', entityId: reservation._id, req });

  res.status(201).json({ success: true, data: reservation });
});

// @route GET /api/reservations
const getReservations = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.user.role === 'student') filter.student = req.user._id;
  if (req.query.status) filter.status = req.query.status;

  const reservations = await Reservation.find(filter)
    .populate('book', 'title author coverImage')
    .populate('student', 'name email studentId')
    .sort('-reservedDate');

  res.json({ success: true, count: reservations.length, data: reservations });
});

// @route PATCH /api/reservations/:id/cancel
const cancelReservation = asyncHandler(async (req, res) => {
  const reservation = await Reservation.findById(req.params.id);
  if (!reservation) throw new ApiError(404, 'Reservation not found');

  if (req.user.role === 'student' && reservation.student.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You can only cancel your own reservations');
  }

  reservation.status = 'cancelled';
  await reservation.save();
  res.json({ success: true, data: reservation });
});

module.exports = { createReservation, getReservations, cancelReservation };
