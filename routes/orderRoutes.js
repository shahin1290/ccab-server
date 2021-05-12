const express = require('express')
const router = express.Router()
const orderController = require('../controllers/orderController')
const { AllowIfLogin, grantAccess } = require('../middleware/auth')

router

router
  .route('/:bootcampId')
  .post(AllowIfLogin, orderController.createOrder)

module.exports = router