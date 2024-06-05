const mongoose = require('mongoose');
const Tour = require('./tourModel');

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

// Create a compound index with a unique option set to true in order to avoid duplicate reviews
// duplicate reviews = same userId + same tourId, so:
reviewSchema.index({ review: 1, user: 1 }, { unique: true });

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

reviewSchema.statics.calcAverageRatings = async function (tourId) {
  // 'this' refers to Model, in this case Tour
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  // console.log(stats);
  // [
  //   {
  //     _id: 665f21ae9dce192b81d6f514,
  //     nRating: 3,
  //     avgRating: 4.333333333333333
  //   }
  // ]

  // If there are no reviews left because of deletion
  // we should set the two properties to their default values specified in the Review model
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: stats[0].avgRating,
      ratingsQuantity: stats[0].nRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: 4.5,
      ratingsQuantity: 0,
    });
  }
};

reviewSchema.post('save', function () {
  // Notes: post middleware does not have access to next
  // 'this' points to current review
  // constructor points the Model of the instance. In this case Review
  this.constructor.calcAverageRatings(this.tour);
});

// Calculate avg ratings on update and delete review
reviewSchema.pre(/^findOneAnd/, async function (next) {
  // 'this' refers to the query, so we have to execute it in order to get access to the current document
  // in our case the current review document and save it as this query's property to pass it to the post middleware below
  this.review = await this.findOne();
  // console.log(review);
  // {
  //   _id: 665f3d2166050031aed9e25a,
  //   rating: 5,
  //   review: 'That was really FUN',
  //   tour: 665f21ae9dce192b81d6f514,
  //   user: {
  //     _id: 5c8a1ec62f8fb814b56fa183,
  //     name: 'Ayla Cornell',
  //     photo: 'user-4.jpg'
  //   },
  //   __v: 0,
  //   id: '665f3d2166050031aed9e25a'
  // }
  next();
});

// We use post in order to have access to the updated review data after the pre middleware above has run
// We need the above pre middleware so that we can have access to the current review and pass it a query property between pre and post middlewares
// so that we can execute calcAverageRatings() after the alteration or deletion of any review
reviewSchema.post(/^findOneAnd/, async function () {
  // this.review is the current review that we passed from pre middleware above and with the constructor function we get the Review model
  // as calcAverageRatings() is a static method
  await this.review.constructor.calcAverageRatings(this.review.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
