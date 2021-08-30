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
  .route('/:bootcampId/klarna/session')
  .get(AllowIfLogin, orderController.readKlarnaSession)
  .post(AllowIfLogin, orderController.createKlarnaSession)

router
  .route('/:bootcampId/klarna/authorize')
  .post(AllowIfLogin, orderController.readKlarnaSession)

router
  .route('/:bootcampId/klarna/order')
  .get(AllowIfLogin, orderController.readKlarnaOrder)
  .post(AllowIfLogin, orderController.createKlarnaOrder)

router
  .route('/push/:bootcampId/:userId')
  .post(orderController.PushOrder)
  .get(orderController.PushOrder)

router
  .route('/capture/:bootcampId')
  .post(AllowIfLogin, orderController.captureOrder)

router
  .route('/:id')
  .post(AllowIfLogin, orderController.createOrder)
  .get(AllowIfLogin, orderController.ViewOrder)

router
  .route('/stripe/stripe-payment-intent')
  .post(AllowIfLogin, orderController.stripePaymentIntent)

router
  .route('/stripe/stripe-subscription')
  .post(AllowIfLogin, orderController.createSubscription)

router
  .route('/stripe/view-subscription')
  .post(AllowIfLogin, orderController.previewSubscription)

router
  .route('/stripe/cancel-subscription')
  .post(AllowIfLogin, orderController.cancelSubscription)

module.exports = router
