const express = require('express')
const router = express.Router()
const requestController = require('../controllers/requestController')
const { AllowIfLogin, grantAccess } = require('../middleware/auth')

router
  .route('/')
  // get all the weeks
  .get(
    AllowIfLogin,
    grantAccess('readOwn', 'request'),
    requestController.getRequests
  )
  // create a new week
  .post(
    AllowIfLogin,
    grantAccess('createAny', 'request'),
    requestController.new
  )

router
  .route('/:id')
  // specific week details
  .get(AllowIfLogin, grantAccess('readOwn', 'request'), requestController.view)
  // update a specific week
  .put(
    AllowIfLogin,
    grantAccess('updateAny', 'request'),
    requestController.update
  )
  // delete a specific week
  .delete(
    AllowIfLogin,
    grantAccess('deleteAny', 'request'),
    requestController.delete
  )

module.exports = router
