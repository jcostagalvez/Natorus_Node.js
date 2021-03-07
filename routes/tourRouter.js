const express = require('express');
const tourController = require('./../controllers/tourControllers');
const authController = require('./../controllers/authControllers');
const router = express.Router();

router.route('/five-tours-cheap').get(tourController.fiveCheperTours, tourController.getAllTours);
router.route('/stats').get(tourController.getTourStats);
router.route('/mont-plan/:year').get(tourController.getMonthlyPlan);


router.route('/')
    .get ( authController.protect, 
           authController.restrictTo('lead-guide', 'admin'),
           tourController.getAllTours)
           
    .post(tourController.createTour);

router.route('/:id')
    .get (tourController.getTour)
    .patch (tourController.updateTour)
    .delete(tourController.deleteTour);
    
module.exports = router;