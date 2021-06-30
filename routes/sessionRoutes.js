const express = require('express')
const router = express.Router()
const sessionController = require('../controllers/sessionController')
const { AllowIfLogin, grantAccess } = require('../middleware/auth')

router
  .route('/')
  // get all the sessions
  .get(
    AllowIfLogin,
    grantAccess('readAny', 'sessions'),
    sessionController.getAllSessions
  )
  // create a new session
  .post(
    AllowIfLogin,
    grantAccess('createOwn', 'session'),
    sessionController.newSession
  )

router
  .route('/:id')
  // specific session details
  .get(
    AllowIfLogin,
    grantAccess('readOwn', 'session'),
    sessionController.sessionDetails
  )
  // update a specific session
  .put(
    AllowIfLogin,
    grantAccess('updateOwn', 'session'),
    sessionController.updateSession
  )
  // delete a specific session
  .delete(
    AllowIfLogin,
    grantAccess('deleteOwn', 'session'),
    sessionController.deleteSession
  )

module.exports = router
