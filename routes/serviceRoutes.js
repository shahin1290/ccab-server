const express = require('express')
const router = express.Router()
const serviceController = require('../controllers/serviceController')
const { AllowIfLogin, grantAccess } = require('../middleware/auth')
const {
  serviceValidCheck,
  uploadCallBack
} = require('../middleware/serviceValid')

router
  .route('/')
  .get(serviceController.getAllServices)

  router
  .route('/admin/new-service')
  .get( AllowIfLogin,
    grantAccess('createAny', 'service'),
    serviceController.newService)
 
router
  .route('/manage')
  .get(
    AllowIfLogin,
    grantAccess('readAny', 'service'),
    serviceController.manageService
  )

router
  .route('/:id')
  // specific service details
  .get(serviceController.serviceDetails)
  // update a specific service
  .put(
    AllowIfLogin,
    grantAccess('updateAny', 'service'),
    uploadCallBack,
    serviceValidCheck,
    serviceController.updateService
  )
  // delete a specific service
  .delete(
    AllowIfLogin,
    grantAccess('deleteAny', 'service'),
    serviceController.deleteService
  )

module.exports = router
