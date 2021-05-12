const express = require('express')
const router = express.Router()
const weekController = require('../controllers/weekController')
const { AllowIfLogin, grantAccess } = require('../middleware/auth')
const { weekValidCheck } = require('../middleware/weekValid')

router
  .route('/:bootcampId')
  // get all the weeks
  .get(AllowIfLogin, grantAccess('readOwn', 'weeks'), weekController.getWeeks)
  // create a new week
  .post(
    AllowIfLogin,
    grantAccess('createAny', 'weeks'),
    weekValidCheck,
    weekController.new
  )
  // update weeks show attribute for specific bootcamp
  .put(weekController.updateWeekShow)

router
  .route('/:bootcampId/:weekId')
  // specific week details
  .get(AllowIfLogin, grantAccess('readOwn', 'weeks'), weekController.view)
  // update a specific week
  .put(AllowIfLogin, grantAccess('updateOwn', 'weeks'), weekController.update)
  // delete a specific week
  .delete(
    AllowIfLogin,
    grantAccess('deleteOwn', 'weeks'),
    weekController.delete
  )

module.exports = router
