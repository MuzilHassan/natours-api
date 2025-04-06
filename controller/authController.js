const jwt = require('jsonwebtoken');

const appError = require('../utils/AppError');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

const signToken = (id) => {
  return jwt.sign(
    {
      id,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE_IN }
  );
};
exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });
  const token = signToken(newUser._id);
  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});

exports.signIn = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password)
    return next(new appError('Please Provide email and password', 400));
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password, user.password)))
    return next(new appError('Incorrect email or password', 401));

  const token = signToken(user._id);

  res.status(200).json({
    status: 'success',
    token,
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) return next(new AppError('Your not authorized', 401));
  const decoded = await jwt.verify(token, process.env.JWT_SECRET);

  const freshUser = await User.findById(decoded._id);
  if (!freshUser) return next(new AppError('The user no longer exists', 401));
  if (freshUser.passwordChangedAt(decoded.iat))
    return next(
      new appError(
        'Password was changed after token was issued! Please login again',
        401
      )
    );
  req.user = freshUser;
  next();
});
