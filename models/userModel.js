const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required '],
  },
  email: {
    type: String,
    required: [true, 'Email is required '],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide correct email'],
  },
  photo: {
    type: String,
  },
  password: {
    type: String,
    required: [true, 'Password is required '],
    minLength: [8, 'password must be atleast 8 characters length'],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'confirm password is required '],
    validate: {
      validator: function (val) {
        return this.password === val;
      },
      message: 'confirm password must match password',
    },
  },
  passwordChangedAt: Date,
});
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userSchema.methods.comparePassword = async (
  candidatePassword,
  userPassword
) => {
  return await bcrypt.compare(candidatePassword, userPassword);
};
userSchema.methods.changePasswordAfter = async (JWTTIMESTAMP) => {
  if (this.passwordChangedAt) {
    secondsTime = parseInt(this.passwordChangedAt.getTime() / 1000);
    return JWTTIMESTAMP < secondsTime;
  }
  return false;
};
const User = mongoose.model('User', userSchema);
module.exports = User;
