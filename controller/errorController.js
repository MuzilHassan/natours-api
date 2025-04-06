const AppError = require('../utils/AppError');

const handleCastError = (err) => {
  const message = `Invalid value for ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};
const handleDupilacteValues = (err) => {
  const key = Object.keys(err.keyValue)[0];
  const value = err.keyValue[key];
  const message = `Duplicate value for field '${key}': '${value}'. Please use another value.`;

  return new AppError(message, 400);
};

const handleValidationError = (err) => {
  const values = Object.values(err.errors)
    .map((val) => val.message)
    .join('. ');
  const message = `Validation error: ${values}`;
  return new AppError(message, 400);
};

const handleJsonWebTokenError = () => new AppError('Please login again ', 401);
const handleTokenExpiredError = () =>
  new AppError('Please login again, your token has been expire', 401);
const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.error('Error 🔥', err);
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong',
    });
  }
};

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    stack: err.stack,
    error: err,
  });
};

const errorFunc = (err, req, res, next) => {
  console.log(err.stack);
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    if (err?.name === 'CastError') error = handleCastError(error);
    if (err?.code === 11000) error = handleDupilacteValues(error);

    if (err?.name === 'ValidationError') error = handleValidationError(error);
    if (err?.name == 'JsonWebTokenError')
      error = handleJsonWebTokenError(error);
    if (err?.name == 'TokenExpiredError')
      error = handleTokenExpiredError(error);
    sendErrorProd(error, res);
  } else if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  }
};

module.exports = errorFunc;
