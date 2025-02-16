const express = require('express');
const userController = require('../controller/userController');
const authController = require('../controller/authController');
const Router = express.Router();

Router.post('/signup', authController.signUp);
Router.route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

module.exports = Router;
