const mongoose = require('mongoose');

/**
 * A single BorrowRecord tracks the full lifecycle of one loan: borrowed ->
 * returned (or overdue). This avoids duplicating data across separate
 * "Borrow" and "Return" collections while still letting Reports query
 * either state via the `status` field.
 */
const borrowRecordSchema = new mongoose.Schema(
  {
    book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // librarian
    borrowDate: { type: Date, default: Date.now },
    dueDate: { type: Date, required: true },
    returnDate: { type: Date },
    receivedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // librarian who processed return
    status: {
      type: String,
      enum: ['borrowed', 'returned', 'overdue'],
      default: 'borrowed',
    },
    fine: { type: mongoose.Schema.Types.ObjectId, ref: 'Fine' },
  },
  { timestamps: true }
);

borrowRecordSchema.index({ student: 1, status: 1 });
borrowRecordSchema.index({ book: 1, status: 1 });

module.exports = mongoose.model('BorrowRecord', borrowRecordSchema);
