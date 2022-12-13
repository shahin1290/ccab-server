const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const { AllowIfLogin, grantAccess } = require("../middleware/auth");

router
  .route("/")
  .get(
    AllowIfLogin,
    grantAccess("readAny", "order"),
    orderController.getAllOrders
  );
router.route("/myorders").get(AllowIfLogin, orderController.studentOrders);

router
  .route("/push/:bootcampId/:userId")
  .post(orderController.PushOrder)
  .get(orderController.PushOrder);

router
  .route("/:id")
  .post(AllowIfLogin, orderController.createOrder)
  .get(AllowIfLogin, orderController.ViewOrder);

router
  .route("/stripe/stripe-payment-intent")
  .post(AllowIfLogin, orderController.stripePaymentIntent);

module.exports = router;
