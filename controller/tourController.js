const Tour = require('../models/tourModel');

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
  filter(){
    
  }
}

exports.getTours = async (req, res) => {
  try {
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
    dbQuery = dbQuery.sort(
      req.query.sort?.replaceAll(',', ' ') || '-createdAt'
    );
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
  } catch (error) {
    console.log(error);
    res.status(404).json({
      status: 'fail',
      message: error,
    });
  }
};
exports.createTour = async (req, res) => {
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

  try {
    const tour = await Tour.create(req.body);
    res.status(201).json({
      status: 'success',
      data: { tour },
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error,
    });
  }
};

exports.getTour = async (req, res) => {
  // const { id } = req.params;
  // const tour = tours.find((data) => data.id === id * 1); //when we multiply any string number with number it becomes int
  try {
    const tour = await Tour.findById(req.params.id);
    res.status(200).json({
      status: 'success',
      data: { tour },
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error,
    });
  }
};

exports.updateTour = async (req, res) => {
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

  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidator: true,
    });
    res.status(200).json({
      status: 'success',
      data: { tour },
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error,
    });
  }
};
exports.deleteTour = async (req, res) => {
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
  try {
    await Tour.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error,
    });
  }
};

exports.addAll = async (req, res) => {
  try {
    const data = await Tour.insertMany(req.body);
    res.status(204).json({
      status: 'success',
      data: data,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({
      status: 'fail',
      message: error,
    });
  }
};
exports.deleteAll = async (req, res) => {
  try {
    await Tour.deleteMany();
    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({
      status: 'fail',
      message: error,
    });
  }
};
