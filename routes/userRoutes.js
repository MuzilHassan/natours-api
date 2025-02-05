const express = require('express');
const userController = require('../controller/userController');
const Router = express.Router();

Router.route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

module.exports = Router;
