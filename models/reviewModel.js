const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'A review cannot be empty'],
    },
    rating: {
      type: Number,
      required: [true, 'A rating must be provided'],
      min: [1, 'A rating must be above 1'],
      max: [5, 'A rating must be below 5'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
  },
  {
    // Options for JSON serialization
    toJSON: { virtuals: true },
    // Options for converting to a plain JavaScript object
    toObject: { virtuals: true },
  }
);

// QUERY middleware
reviewSchema.pre(/^find/, function (next) {
  // this.populate({
  //   // populate() fetches the referenced objects and populates the specified field
  //   path: 'tour',
  //   select: '-guides name', // select indicates which fields we want or dont't want to be populated
  // }).populate({
  //   path: 'user',
  //   select: 'name photo',
  // });
  this.populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});
const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
