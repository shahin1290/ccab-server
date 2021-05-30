const express = require('express')
const router = express.Router()
const orderController = require('../controllers/orderController')
const { AllowIfLogin, grantAccess } = require('../middleware/auth')

router
  .route('/')
  .get(
    AllowIfLogin,
    grantAccess('readAny', 'order'),
    orderController.getAllOrders
  )
router.route('/myorders').get(AllowIfLogin, orderController.studentOrders)

router
  .route('/:bootcampId/klarna/order')
  .post(AllowIfLogin, orderController.createKlarnaOrder)
  .get(AllowIfLogin, orderController.ReadKlarnaOrder)

router
  .route('/push/:bootcampId/:userId')
  .post(orderController.PushOrder)
  .get(orderController.PushOrder)

router
  .route('/capture/:bootcampId')
  .get(AllowIfLogin, orderController.captureOrder)

router
  .route('/:bootcampId')
  .post(AllowIfLogin, orderController.createOrder)
  .get(AllowIfLogin, orderController.ViewOrder)

router
  .route('/:bootcampId/stripe-payment-intent')
  .post(AllowIfLogin, orderController.stripePaymentIntent)

module.exports = router
