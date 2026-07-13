const asyncHandler = require('../utils/asyncHandler');
const Book = require('../models/Book');
const User = require('../models/User');
const BorrowRecord = require('../models/BorrowRecord');

// @desc    Aggregate stats for the admin/librarian dashboard, including a
//          12-month borrow trend for the Chart.js line/bar chart.
// @route   GET /api/dashboard
// @access  Private/Admin,Librarian
const getDashboardStats = asyncHandler(async (req, res) => {
  const [
    totalBooks,
    availableBooksAgg,
    borrowedBooksCount,
    totalStudents,
    totalLibrarians,
    overdueCount,
    recentTransactions,
  ] = await Promise.all([
    Book.countDocuments(),
    Book.aggregate([{ $group: { _id: null, sum: { $sum: '$availableQuantity' } } }]),
    BorrowRecord.countDocuments({ status: { $in: ['borrowed', 'overdue'] } }),
    User.countDocuments({ role: 'student' }),
    User.countDocuments({ role: 'librarian' }),
    BorrowRecord.countDocuments({ status: 'overdue' }),
    BorrowRecord.find()
      .populate('book', 'title')
      .populate('student', 'name')
      .sort('-createdAt')
      .limit(10),
  ]);

  // Monthly borrow statistics for the last 12 months
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
  twelveMonthsAgo.setDate(1);

  const monthlyStats = await BorrowRecord.aggregate([
    { $match: { borrowDate: { $gte: twelveMonthsAgo } } },
    {
      $group: {
        _id: { year: { $year: '$borrowDate' }, month: { $month: '$borrowDate' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  res.json({
    success: true,
    data: {
      totalBooks,
      availableBooks: availableBooksAgg[0]?.sum || 0,
      borrowedBooks: borrowedBooksCount,
      totalStudents,
      totalLibrarians,
      overdueBooks: overdueCount,
      recentTransactions,
      monthlyBorrowStats: monthlyStats.map((m) => ({
        year: m._id.year,
        month: m._id.month,
        count: m.count,
      })),
    },
  });
});

module.exports = { getDashboardStats };
