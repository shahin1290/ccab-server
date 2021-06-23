const express = require('express')
const router = express.Router()
const jobController = require('../controllers/jobController')
const { AllowIfLogin, grantAccess } = require('../middleware/auth')
const { uploadCallBack } = require('../middleware/jobValid')

router
  .route('/')
  // get all the weeks
  .get(AllowIfLogin, grantAccess('readAny', 'job'), jobController.getJobs)
  // create a new week
  .post(uploadCallBack, jobController.new)

  //download cv file
router.route('/:id/download').get(AllowIfLogin, jobController.downloadFile)

 //download others file
 router.route('/:id/download/others').get(AllowIfLogin, jobController.downloadOthers)

module.exports = router
