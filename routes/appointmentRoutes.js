const express = require('express')
const router = express.Router()
const appointmentController = require('../controllers/appointmentController')
const { AllowIfLogin, grantAccess } = require('../middleware/auth')

router
  .route('/')
  // get all the weeks
  .get(
    AllowIfLogin,
    grantAccess('readAny', 'appointments'),
    appointmentController.getAllAppointments
  )
  // create a new week
  .post(
    AllowIfLogin,
    grantAccess('createOwn', 'appointment'),
    appointmentController.newAppointment
  )

router
  .route('/:id')
  // specific week details
  .get(AllowIfLogin, grantAccess('readOwn', 'appointment'), appointmentController.view)
  // update a specific week
  .put(
    AllowIfLogin,
    grantAccess('updateAny', 'appointment'),
    appointmentController.update
  )
  // delete a specific week
  .delete(
    AllowIfLogin,
    grantAccess('deleteAny', 'appointment'),
    appointmentController.delete
  )

module.exports = router
