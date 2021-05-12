const express = require('express')
const router = express.Router()
const bootcampController = require('../controllers/bootcampController')
const { AllowIfLogin, grantAccess } = require('../middleware/auth')
const {
  bootcampValidCheck,
  uploadCallBack
} = require('../middleware/bootcampValid')

router
  .route('/')
  .get(bootcampController.getAllBootcamps)
  .post(
    AllowIfLogin,
    grantAccess('createAny', 'bootcamp'),
    bootcampController.newBootcamp
  )
router
  .route('/mange')
  .get(
    AllowIfLogin,
    grantAccess('readAny', 'bootcamp'),
    bootcampController.MangeBootcamp
  )

router
  .route('/:id')
  // specific bootcamp details
  .get(bootcampController.bootcampDetails)
  // update a specific bootcamp
  .put(
    AllowIfLogin,
    grantAccess('updateAny', 'bootcamp'),
    uploadCallBack,
    bootcampValidCheck,
    bootcampController.updateBootcamp
  )
  // delete a specific bootcamp
  .delete(
    AllowIfLogin,
    grantAccess('deleteAny', 'bootcamp'),
    bootcampController.deleteBootcamp
  )

module.exports = router
