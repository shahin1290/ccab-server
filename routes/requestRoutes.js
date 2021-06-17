const express = require('express')
const router = express.Router()
const requestController = require('../controllers/requestController')
const { AllowIfLogin, grantAccess } = require('../middleware/auth')

router
  .route('/')
  // get all the weeks
  .get(AllowIfLogin, grantAccess('readOwn', 'request'), requestController.getRequests)
  // create a new week
  .post(
    AllowIfLogin,
    grantAccess('createAny', 'request'),
    requestController.new
  )
  // update weeks show attribute for specific bootcamp
  .put(requestController.updateWeekShow)

router
  .route('/:bootcampId/:weekId')
  // specific week details
  .get(AllowIfLogin, grantAccess('readOwn', 'weeks'), requestController.view)
  // update a specific week
  .put(AllowIfLogin, grantAccess('updateOwn', 'weeks'), requestController.update)
  // delete a specific week
  .delete(
    AllowIfLogin,
    grantAccess('deleteOwn', 'weeks'),
    requestController.delete
  )

module.exports = router
