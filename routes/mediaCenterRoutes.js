const express = require('express')
const router = express.Router()
const mediaCenterController = require('../controllers/mediaCenterController')
const { AllowIfLogin, grantAccess } = require('../middleware/auth')
const {
  mediaCenterValidCheck,
  uploadCallBack
} = require('../middleware/mediaCenterValid')

router
  .route('/')
  .get(mediaCenterController.getAllMediaCenters)
  .post(
    AllowIfLogin,
    grantAccess('createAny', 'mediaCenter'),
    mediaCenterController.newMediaCenter
  )
router
  .route('/mange')
  .get(
    AllowIfLogin,
    grantAccess('readAny', 'mediaCenter'),
    mediaCenterController.mangeMediaCenter
  )

router
  .route('/:id')
  // specific mediaCenter details
  .get(mediaCenterController.mediaCenterDetails)
  // update a specific mediaCenter
  .put(
    AllowIfLogin,
    grantAccess('updateAny', 'mediaCenter'),
    uploadCallBack,
    mediaCenterValidCheck,
    mediaCenterController.updateMediaCenter
  )
  // delete a specific mediaCenter
  .delete(
    AllowIfLogin,
    grantAccess('deleteAny', 'mediaCenter'),
    mediaCenterController.deleteMediaCenter
  )

module.exports = router
