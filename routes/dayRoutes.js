const express = require('express')
const router = express.Router()
const dayController = require('../controllers/dayController')
const { AllowIfLogin, grantAccess } = require('../middleware/auth')
const { dayValidCheck, uploadCallBack } = require('../middleware/dayValid')

router
  .route('/:weekId')
  // get all the days  for this specific week
  .get(AllowIfLogin, grantAccess('readOwn', 'days'), dayController.getDays)
  // create a new day  for this specific week
  .post(
    AllowIfLogin,
    grantAccess('createAny', 'days'),
    uploadCallBack,
    dayValidCheck,
    dayController.new
  )

router
  .route('/:weekId/:id')
  // specific day details
  .get(AllowIfLogin, grantAccess('readOwn', 'days'), dayController.view)
  // update a specific day
  .put(
    AllowIfLogin,
    grantAccess('updateOwn', 'days'),
    uploadCallBack,
    dayValidCheck,
    dayController.update
  )
  // delete a specific day
  .delete(AllowIfLogin, grantAccess('deleteOwn', 'days'), dayController.delete)

module.exports = router
