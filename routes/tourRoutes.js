const express = require('express');
const tourController = require('../controller/tourController');
const Router = express.Router();

Router.route('/').get(tourController.getTours).post(tourController.createTour);
Router.route('/top-tours').get(
  tourController.aliasTopTours,
  tourController.getTours
);
Router.route('/all')
  .post(tourController.addAll)
  .delete(tourController.deleteAll);
Router.route('/tour-stats').get(tourController.tourStats);
Router.route('/monthly-plan/:year').get(tourController.monthlyPlan);

Router.route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);
module.exports = Router;
