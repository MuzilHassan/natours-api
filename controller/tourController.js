const Tour = require('../models/tourModel');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

//Alias tours are used when we need same functionality of a route but with minimum difference
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = 5;
  req.query.sort = '-ratingsAverage,price';
  req.query.feilds = 'name,ratingsAverage,price,summary,difficulty';

  next();
};

// exports.checkId = (req, res, next, val) => {
//   const id = val * 1;

//   const index = tours.findIndex((data) => data.id == id);

//   if (index === -1)
//     return res.status(404).json({
//       message: 'Invalid Id',
//       status: 'fail',
//     });
//   req.body.index = index;
//   next();
// };
// exports.checkBody = (req, res, next) => {
//   const { name, price } = req.body;
//   if (name && price) return next();
//   res.status(400).json({
//     status: 'fail',
//     message: 'Missing name or Price',
//   });
// };

class apiFeature {
  constructor(query, querString) {
    this.querString = querString;
    this.query = query;
  }
  filter() {}
}

exports.getTours = async (req, res, next) => {
  const query = { ...req.query };
  const excludedFeilds = ['page', 'limit', 'sort', 'feilds'];

  excludedFeilds.forEach((item) => delete query[item]);
  const querString = JSON.stringify(query).replace(
    /\b(gt|gte|lt|lte)\b/g,
    function (match) {
      return `$${match}`;
    }
  );

  let dbQuery = Tour.find(JSON.parse(querString));
  dbQuery = dbQuery.sort(req.query.sort?.replaceAll(',', ' ') || '-createdAt');
  //  dbQuery = req.query.limit ? dbQuery.limit(req.query.limit) : dbQuery;

  dbQuery = req.query.feilds
    ? dbQuery.select(req.query.feilds.replaceAll(',', ' '))
    : dbQuery.select('-__v');
  // req.query.sort
  //   ? (dbQuery = dbQuery.sort(req.query.sort))
  //   : (dbQuery = dbQuery.sort('-createdAt'));

  const page = req.query.page * 1 || 1;
  const limit = req.query.limit || 100;
  const skip = (page - 1) * limit;

  dbQuery = dbQuery.skip(skip).limit(limit);
  if (req.query.page) {
    const total = await Tour.countDocuments();
    console.log(total, skip);
    if (skip >= total) throw new Error('There are no more pages');
  }
  const tours = await dbQuery;
  res.status(200).json({
    status: 'success',

    data: {
      tours,
    },
  });
};
exports.createTour = catchAsync(async (req, res, next) => {
  // const id = tours[tours.length - 1].id + 1;
  // console.log(id);
  // const newTour = { ...req.body, id: id };
  // tours.push(newTour);
  // fs.writeFile(
  //   `${__dirname}/dev-data/data/tours-simple.json`,
  //   JSON.stringify(tours),
  //   (err) =>
  //     res.status(201).json({
  //       status: 'success',
  //       data: { newTour },
  //     })
  // );

  const tour = await Tour.create(req.body);
  res.status(201).json({
    status: 'success',
    data: { tour },
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  // const { id } = req.params;
  // const tour = tours.find((data) => data.id === id * 1); //when we multiply any string number with number it becomes int

  const tour = await Tour.findById(req.params.id);
  if (!tour) return next(new AppError('No Tour was find for this ID', 404));
  res.status(200).json({
    status: 'success',
    data: { tour },
  });
});

exports.updateTour = catchAsync(async (req, res, next) => {
  //Put is used when entire data is bening updated and patch is used when some propertis of the object chnage
  // const { index, ...data } = req.body;
  // const newTour = data;
  // tours[index] = { ...tours[index], ...newTour };
  // fs.writeFile(
  //   `${__dirname}/dev-data/data/tours-simple.json`,
  //   JSON.stringify(tours),
  //   (err) =>
  //     res.status(200).json({
  //       status: 'success',
  //       data: { tour: tours[index] },
  //     })
  // );

  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!tour) return next(new AppError('No Tour was find for this ID', 404));
  res.status(200).json({
    status: 'success',
    data: { tour },
  });
});
exports.deleteTour = catchAsync(async (req, res, next) => {
  // const newTours = tours.splice(req.body.index);
  // fs.writeFile(
  //   `${__dirname}/dev-data/data/tours-simple.json`,
  //   JSON.stringify(newTours),
  //   (err) =>
  //     res.status(204).json({
  //       status: 'success',
  //       data: null,
  //     })
  // );

  const tour = await Tour.findByIdAndDelete(req.params.id);

  if (!tour) return next(new AppError('No Tour was find for this ID', 404));
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.addAll = catchAsync(async (req, res, next) => {
  const data = await Tour.insertMany(req.body);
  res.status(204).json({
    status: 'success',
    data: data,
  });
});
exports.deleteAll = catchAsync(async (req, res, next) => {
  await Tour.deleteMany();
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.tourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    { $match: { ratingsAverage: { $gte: 4.5 } } },
    {
      $group: {
        _id: { $toLower: '$difficulty' },
        totalTours: { $sum: 1 },
        numRating: { $sum: '$ratingsQuantity' },
        ratingsAverage: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: {
          $max: '$price',
        },
      },
    },
    {
      $sort: {
        avgPrice: 1,
      },
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: stats,
  });
});

exports.monthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const monthlyPlan = await Tour.aggregate([
    { $unwind: '$startDates' },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTours: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: {
        month: {
          $switch: {
            branches: [
              { case: { $eq: ['$_id', 1] }, then: 'January' },
              { case: { $eq: ['$_id', 2] }, then: 'February' },
              { case: { $eq: ['$_id', 3] }, then: 'March' },
              { case: { $eq: ['$_id', 4] }, then: 'April' },
              { case: { $eq: ['$_id', 5] }, then: 'May' },
              { case: { $eq: ['$_id', 6] }, then: 'June' },
              { case: { $eq: ['$_id', 7] }, then: 'July' },
              { case: { $eq: ['$_id', 8] }, then: 'August' },
              { case: { $eq: ['$_id', 9] }, then: 'September' },
              { case: { $eq: ['$_id', 10] }, then: 'October' },
              { case: { $eq: ['$_id', 11] }, then: 'November' },
              { case: { $eq: ['$_id', 12] }, then: 'December' },
            ],
          },
        },
      },
    },
    {
      $project: { _id: 0 },
    },
    {
      $sort: { numTours: -1 },
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: monthlyPlan,
  });
});
