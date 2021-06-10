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
  .get( AllowIfLogin,orderController.readKlarnaSession)
  .post(AllowIfLogin, orderController.createKlarnaSession)

  router
  .route('/:bootcampId/klarna/authorize')
  .post( AllowIfLogin,orderController.readKlarnaSession)
 
  

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
  .route('/:bootcampId')
  .post(AllowIfLogin, orderController.createOrder)
  .get(AllowIfLogin, orderController.ViewOrder)

router
  .route('/:bootcampId/stripe-payment-intent')
  .post(AllowIfLogin, orderController.stripePaymentIntent)

module.exports = router
