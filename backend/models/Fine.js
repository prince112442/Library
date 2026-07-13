const mongoose = require('mongoose');

const fineSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    borrowRecord: { type: mongoose.Schema.Types.ObjectId, ref: 'BorrowRecord', required: true },
    amount: { type: Number, required: true, min: 0 },
    reason: { type: String, default: 'Overdue book return' },
    status: {
      type: String,
      enum: ['unpaid', 'paid', 'waived'],
      default: 'unpaid',
    },
    paidDate: { type: Date },
    waivedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Fine', fineSchema);
