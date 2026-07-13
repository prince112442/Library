const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema(
  {
    book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reservedDate: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['pending', 'fulfilled', 'cancelled', 'expired'],
      default: 'pending',
    },
    expiryDate: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Reservation', reservationSchema);
