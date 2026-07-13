const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const Book = require('../models/Book');
const User = require('../models/User');
const BorrowRecord = require('../models/BorrowRecord');
const Fine = require('../models/Fine');
const Reservation = require('../models/Reservation');
const Notification = require('../models/Notification');
const ApiFeatures = require('../utils/apiFeatures');
const logAudit = require('../utils/logAudit');
const sendEmail = require('../config/nodemailer');

const BORROW_DURATION_DAYS = Number(process.env.BORROW_DURATION_DAYS) || 14;
const FINE_PER_DAY = Number(process.env.FINE_PER_DAY) || 5;
const MAX_ACTIVE_BORROWS = 5;

// @desc    Issue a book to a student (librarian action)
// @route   POST /api/borrow
// @body    { bookId, studentId }
// @access  Private/Librarian,Admin
const borrowBook = asyncHandler(async (req, res) => {
  const { bookId, studentId } = req.body;

  const [book, student] = await Promise.all([
    Book.findById(bookId),
    User.findOne({ _id: studentId, role: 'student' }),
  ]);

  if (!book) throw new ApiError(404, 'Book not found');
  if (!student) throw new ApiError(404, 'Student not found');
  if (book.availableQuantity < 1) throw new ApiError(400, 'No copies of this book are currently available');

  const activeBorrowCount = await BorrowRecord.countDocuments({ student: student._id, status: { $in: ['borrowed', 'overdue'] } });
  if (activeBorrowCount >= MAX_ACTIVE_BORROWS) {
    throw new ApiError(400, `Student has reached the maximum of ${MAX_ACTIVE_BORROWS} borrowed books`);
  }

  const outstandingFines = await Fine.countDocuments({ student: student._id, status: 'unpaid' });
  if (outstandingFines > 0) {
    throw new ApiError(400, 'Student has unpaid fines and cannot borrow until they are settled');
  }

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + BORROW_DURATION_DAYS);

  const record = await BorrowRecord.create({
    book: book._id,
    student: student._id,
    issuedBy: req.user._id,
    dueDate,
  });

  book.availableQuantity -= 1;
  await book.save();

  await logAudit({ user: req.user, action: 'BORROW_BOOK', entity: 'BorrowRecord', entityId: record._id, req });

  sendEmail({
    to: student.email,
    subject: 'Book Borrowed - Due Date Reminder',
    html: `<p>Hi ${student.name},</p><p>You have borrowed <strong>${book.title}</strong>. It is due on <strong>${dueDate.toDateString()}</strong>.</p>`,
  });

  res.status(201).json({ success: true, data: record });
});

// @desc    Process a returned book (librarian action)
// @route   POST /api/borrow/:id/return
// @access  Private/Librarian,Admin
const returnBook = asyncHandler(async (req, res) => {
  const record = await BorrowRecord.findById(req.params.id).populate('book').populate('student');
  if (!record) throw new ApiError(404, 'Borrow record not found');
  if (record.status === 'returned') throw new ApiError(400, 'This book has already been returned');

  record.returnDate = new Date();
  record.receivedBy = req.user._id;
  record.status = 'returned';

  // Calculate overdue fine, if any
  let fineRecord = null;
  if (record.returnDate > record.dueDate) {
    const daysLate = Math.ceil((record.returnDate - record.dueDate) / (1000 * 60 * 60 * 24));
    const amount = daysLate * FINE_PER_DAY;

    fineRecord = await Fine.create({
      student: record.student._id,
      borrowRecord: record._id,
      amount,
      reason: `Returned ${daysLate} day(s) late`,
    });
    record.fine = fineRecord._id;

    await Notification.create({
      user: record.student._id,
      title: 'Fine Issued',
      message: `A fine of $${amount} was issued for returning "${record.book.title}" ${daysLate} day(s) late.`,
      type: 'fine',
    });
  }

  await record.save();

  // Restore stock
  const book = await Book.findById(record.book._id);
  book.availableQuantity = Math.min(book.quantity, book.availableQuantity + 1);
  await book.save();

  // If there's a pending reservation for this book, notify the next student
  const nextReservation = await Reservation.findOne({ book: book._id, status: 'pending' }).sort('reservedDate');
  if (nextReservation) {
    nextReservation.status = 'fulfilled';
    await nextReservation.save();
    await Notification.create({
      user: nextReservation.student,
      title: 'Reserved Book Available',
      message: `"${book.title}" is now available for pickup.`,
      type: 'reservation_ready',
    });
  }

  await logAudit({ user: req.user, action: 'RETURN_BOOK', entity: 'BorrowRecord', entityId: record._id, req });

  res.json({ success: true, data: record, fine: fineRecord });
});

// @desc    List borrow records (filterable by student/status/book)
// @route   GET /api/borrow
// @access  Private
const getBorrowRecords = asyncHandler(async (req, res) => {
  // Students may only view their own borrowing history
  if (req.user.role === 'student') {
    req.query.student = req.user._id.toString();
  }

  const features = new ApiFeatures(
    BorrowRecord.find().populate('book', 'title author isbn coverImage').populate('student', 'name email studentId'),
    req.query
  )
    .filter()
    .sort()
    .paginate();

  const [records, total] = await Promise.all([features.query, BorrowRecord.countDocuments()]);

  res.json({
    success: true,
    count: records.length,
    total,
    page: features.pagination.page,
    pages: Math.ceil(total / features.pagination.limit),
    data: records,
  });
});

// @desc    Marks any active records past their due date as 'overdue'.
//          Intended to be run on a schedule (e.g. daily cron) or on demand.
// @route   POST /api/borrow/mark-overdue
// @access  Private/Admin,Librarian
const markOverdue = asyncHandler(async (req, res) => {
  const result = await BorrowRecord.updateMany(
    { status: 'borrowed', dueDate: { $lt: new Date() } },
    { $set: { status: 'overdue' } }
  );
  res.json({ success: true, message: `${result.modifiedCount} record(s) marked overdue` });
});

module.exports = { borrowBook, returnBook, getBorrowRecords, markOverdue };
