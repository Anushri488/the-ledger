const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Booking = require('../models/Booking');

// Middleware — token verify karo
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Login karo pehle' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch {
    res.status(401).json({ message: 'Token invalid hai' });
  }
}

// Booking save karo
router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      roomId, roomTitle, checkIn, checkOut,
      eventDate, nights, guests, totalAmount, mode,
    } = req.body;

    const bookingId = `BK${Math.floor(100000 + Math.random() * 900000)}`;

    const booking = new Booking({
      user: req.userId,
      roomId,
      roomTitle,
      checkIn: mode === 'hotel' ? checkIn : null,
      checkOut: mode === 'hotel' ? checkOut : null,
      eventDate: mode === 'event' ? eventDate : null,
      nights,
      guests,
      totalAmount,
      bookingId,
    });

    await booking.save();

    res.status(201).json({
      message: 'Booking ho gayi!',
      bookingId,
      booking,
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// User ki saari bookings dekho
router.get('/my', authMiddleware, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.userId }).sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;