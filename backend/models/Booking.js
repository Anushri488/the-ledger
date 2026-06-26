const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  roomId: { type: Number, required: true },
  roomTitle: { type: String, required: true },
  checkIn: { type: Date },
  checkOut: { type: Date },
  eventDate: { type: Date },
  nights: { type: Number, default: 1 },
  guests: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  bookingId: { type: String, unique: true },
  status: {
    type: String,
    enum: ['confirmed', 'cancelled'],
    default: 'confirmed',
  },
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);