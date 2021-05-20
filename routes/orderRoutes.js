const express = require('express')
const router = express.Router()
const orderController = require('../controllers/orderController')
const { AllowIfLogin, grantAccess } = require('../middleware/auth')

  router
    .route('/:bootcampId/klarna/order')
    .post(AllowIfLogin,orderController.createKlarnaOrder)
  .get(AllowIfLogin,orderController.ReadKlarnaOrder)

  router
    .route('/push/:bootcampId/:userId')
    .post(orderController.PushOrder)
    .get(orderController.PushOrder)

    router
    .route('/capture/:bootcampId')
    .post(AllowIfLogin,orderController.captureOrder)


router
  .route('/:bootcampId')
  .post(AllowIfLogin, orderController.createOrder)

  router
  .route('/myorders')
  .get(AllowIfLogin, orderController.studentOrders)

module.exports = router