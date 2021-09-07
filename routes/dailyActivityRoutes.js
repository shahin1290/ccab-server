const express = require('express')
const router = express.Router()
const dailyActivityController = require('../controllers/dailyActivityController')
const { AllowIfLogin } = require('../middleware/auth')

router
  .route('/:bootcampId')
  .get(AllowIfLogin, dailyActivityController.getAllDailyActivities)
  .post(AllowIfLogin, dailyActivityController.newDailyAcivity)
  .put(AllowIfLogin, dailyActivityController.updateDailyAcivity)

module.exports = router
