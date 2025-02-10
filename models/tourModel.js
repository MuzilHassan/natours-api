const mongoose = require('mongoose');
const slugify = require('slugify');
var validator = require('validator');
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A Tour must have a name'],
      unique: true,
      trim: true,
    },
    slug: String,
    price: {
      type: Number,
      required: [true, 'A Tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      default: 0,
      validate: {
        validator: function (val) {
          return val < this.price;
        },
        message: 'Price discount ({VALUE}) should be less than the price',
      },
    },
    ratings: {
      type: Number,
      default: 4.5,
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A Tour must have a group size'],
    },
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must a difficulty level'],
      enum: ['easy', 'medium', 'hard'],
    },
    ratingsAverage: Number,
    ratingsQuantity: Number,
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a summary'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have an cover image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    startDates: [Date],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

tourSchema.virtual('durationWeek').get(function () {
  return this.duration / 7;
});

tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, {
    lower: true,
  });

  next();
});
const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;
