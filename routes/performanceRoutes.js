const express = require('express')
const router = express.Router()
const performanceController = require('../controllers/performanceController')
const { AllowIfLogin, grantAccess } = require('../middleware/auth')

router
  .route('/')
  // get all the performances
  .get(
    AllowIfLogin,
    performanceController.getAllPerformances
  )
  // create a new performance
  .post(
    AllowIfLogin,
    performanceController.newPerformance
  )

router
  .route('/:id')
  // specific performance details
  .get(
    AllowIfLogin,
    grantAccess('updateOwn', 'performance'),
    performanceController.performanceDetails
  )
  // update a specific performance
  .put(
    AllowIfLogin,
    performanceController.updatePerformance
  )
  // delete a specific performance
  .delete(
    AllowIfLogin,
    performanceController.deletePerformance
  )

module.exports = router
