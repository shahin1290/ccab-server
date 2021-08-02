const express = require('express')
const router = express.Router()
const performanceController = require('../controllers/performanceController')
const { AllowIfLogin, grantAccess } = require('../middleware/auth')

router
  .route('/daily-performance/:bootcampId')
  // specific performance details
  .get(AllowIfLogin, performanceController.performanceDetails)
  // update a specific performance
  .put(AllowIfLogin, performanceController.updatePerformance)
  // delete a specific performance
  .delete(AllowIfLogin, performanceController.deletePerformance)

router
  .route('/watching-lectures/:bootcampId')
  // get all the watching-lectures
  .get(AllowIfLogin, performanceController.watchingLectures)

router
  .route('/:bootcampId/:userId')
  // get all the performances
  .get(AllowIfLogin, performanceController.getAllPerformances)
  // create a new performance
  .post(AllowIfLogin, performanceController.newPerformance)

module.exports = router
