const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tour',
    required: [true, 'Booking must belong to a tour!'],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Booking must belong to a user!'],
  },
  price: {
    type: Number,
    required: [true, 'Booking must have a price.'],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  paid: {
    type: Boolean,
    default: true,
  },
});

// Create a compound index with a unique option set to true in order to avoid duplicate bookings from the same user
// duplicate bookings = same userId + same tourId, so:
bookingSchema.index({ tour: 1, user: 1 }, { unique: true });

// QUERY middleware
bookingSchema.pre(/^find/, function (next) {
  this.populate('user').populate({
    path: 'tour',
    select: 'name',
  });
  next();
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
