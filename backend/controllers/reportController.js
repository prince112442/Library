const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const Book = require('../models/Book');
const User = require('../models/User');
const BorrowRecord = require('../models/BorrowRecord');
const Fine = require('../models/Fine');

// Maps a report `type` query param to a data-fetching function that
// returns { columns, rows, title } used by both the PDF and Excel exporters.
const REPORT_SOURCES = {
  books: async () => {
    const books = await Book.find().populate('category', 'name');
    return {
      title: 'Books Report',
      columns: ['ISBN', 'Title', 'Author', 'Category', 'Quantity', 'Available'],
      rows: books.map((b) => [b.isbn, b.title, b.author, b.category?.name || '-', b.quantity, b.availableQuantity]),
    };
  },
  borrowed: async () => {
    const records = await BorrowRecord.find({ status: { $in: ['borrowed', 'overdue'] } })
      .populate('book', 'title')
      .populate('student', 'name studentId');
    return {
      title: 'Currently Borrowed Books Report',
      columns: ['Student', 'Student ID', 'Book', 'Borrow Date', 'Due Date', 'Status'],
      rows: records.map((r) => [
        r.student?.name,
        r.student?.studentId || '-',
        r.book?.title,
        r.borrowDate.toDateString(),
        r.dueDate.toDateString(),
        r.status,
      ]),
    };
  },
  returned: async () => {
    const records = await BorrowRecord.find({ status: 'returned' })
      .populate('book', 'title')
      .populate('student', 'name studentId');
    return {
      title: 'Returned Books Report',
      columns: ['Student', 'Book', 'Borrow Date', 'Return Date'],
      rows: records.map((r) => [r.student?.name, r.book?.title, r.borrowDate.toDateString(), r.returnDate?.toDateString() || '-']),
    };
  },
  students: async () => {
    const students = await User.find({ role: 'student' });
    return {
      title: 'Students Report',
      columns: ['Name', 'Student ID', 'Email', 'Department', 'Status'],
      rows: students.map((s) => [s.name, s.studentId || '-', s.email, s.department || '-', s.isActive ? 'Active' : 'Inactive']),
    };
  },
  librarians: async () => {
    const librarians = await User.find({ role: 'librarian' });
    return {
      title: 'Librarians Report',
      columns: ['Name', 'Employee ID', 'Email', 'Status'],
      rows: librarians.map((l) => [l.name, l.employeeId || '-', l.email, l.isActive ? 'Active' : 'Inactive']),
    };
  },
  overdue: async () => {
    const records = await BorrowRecord.find({ status: 'overdue' })
      .populate('book', 'title')
      .populate('student', 'name studentId email');
    return {
      title: 'Overdue Books Report',
      columns: ['Student', 'Email', 'Book', 'Due Date', 'Days Overdue'],
      rows: records.map((r) => [
        r.student?.name,
        r.student?.email,
        r.book?.title,
        r.dueDate.toDateString(),
        Math.ceil((Date.now() - r.dueDate) / (1000 * 60 * 60 * 24)),
      ]),
    };
  },
  fines: async () => {
    const fines = await Fine.find().populate('student', 'name studentId').populate({ path: 'borrowRecord', populate: { path: 'book', select: 'title' } });
    return {
      title: 'Fines Report',
      columns: ['Student', 'Book', 'Amount', 'Status', 'Reason'],
      rows: fines.map((f) => [f.student?.name, f.borrowRecord?.book?.title || '-', `$${f.amount}`, f.status, f.reason]),
    };
  },
};

// @desc    Export a report as PDF or Excel
// @route   GET /api/reports/:type?format=pdf|excel
// @access  Private/Admin,Librarian
const exportReport = asyncHandler(async (req, res) => {
  const { type } = req.params;
  const format = req.query.format || 'pdf';

  const source = REPORT_SOURCES[type];
  if (!source) throw new ApiError(400, `Unknown report type: ${type}`);

  const { title, columns, rows } = await source();

  if (format === 'excel') {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(title);
    sheet.addRow(columns).font = { bold: true };
    rows.forEach((row) => sheet.addRow(row));
    sheet.columns.forEach((col) => (col.width = 20));

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${type}-report.xlsx"`);
    await workbook.xlsx.write(res);
    return res.end();
  }

  // Default: PDF
  const doc = new PDFDocument({ margin: 40, size: 'A4' });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${type}-report.pdf"`);
  doc.pipe(res);

  doc.fontSize(18).text(title, { align: 'center' });
  doc.moveDown();
  doc.fontSize(9).text(`Generated: ${new Date().toLocaleString()}`, { align: 'right' });
  doc.moveDown();

  const colWidth = (doc.page.width - 80) / columns.length;
  let y = doc.y;
  doc.font('Helvetica-Bold');
  columns.forEach((col, i) => doc.text(String(col), 40 + i * colWidth, y, { width: colWidth }));
  doc.font('Helvetica');
  doc.moveDown();

  rows.forEach((row) => {
    y = doc.y;
    if (y > doc.page.height - 60) {
      doc.addPage();
      y = doc.y;
    }
    row.forEach((cell, i) => doc.text(String(cell ?? '-'), 40 + i * colWidth, y, { width: colWidth }));
    doc.moveDown();
  });

  doc.end();
});

module.exports = { exportReport };
