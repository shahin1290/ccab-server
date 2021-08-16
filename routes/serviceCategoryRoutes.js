const express = require('express')
const router = express.Router()
const serviceCategoryController = require('../controllers/serviceCategoryController')
const { AllowIfLogin, grantAccess } = require('../middleware/auth')

router
  .route('/')
  // get all the weeks
  .get(serviceCategoryController.getServiceCategories)
  // create a new week
  .post(
    AllowIfLogin,
    grantAccess('createAny', 'serviceCategory'),
    serviceCategoryController.new
  )

router
  .route('/:id')
  // specific week details
  .get(
    AllowIfLogin,
    grantAccess('readAny', 'serviceCategory'),
    serviceCategoryController.view
  )
  // update a specific week
  .put(
    AllowIfLogin,
    grantAccess('updateAny', 'serviceCategory'),
    serviceCategoryController.update
  )
  // delete a specific week
  .delete(
    AllowIfLogin,
    grantAccess('deleteAny', 'serviceCategory'),
    serviceCategoryController.delete
  )

module.exports = router
