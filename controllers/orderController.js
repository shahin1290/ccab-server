const { validationResult } = require("express-validator");
const User = require("../models/userModel");
const Order = require("../models/orderModel");
const Bootcamp = require("../models/bootcampModel");
const stripe = require("stripe")(process.env.STRIPE_SECRET);
const axios = require("axios");
const { sendMail } = require("../middleware/sendMail");
const { sendSubscriptionMail } = require("../middleware/sendSubscriptionMail");

exports.stripePaymentIntent = async (req, res) => {
  const { amount } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: "usd",
      payment_method_types: ["card"],
    });

    // Send publishable key and PaymentIntent details to client
    res.status(200).send(paymentIntent.client_secret);
  } catch (e) {
    return res.status(400).send({
      error: {
        message: e.message,
      },
    });
  }
};

//@ DESC POST A NEW order
//@ ROUTE /api/order/
//@ access login user
exports.createOrder = async (req, res) => {
  const { token, amount, currency } = req.body;
  const { id } = req.params;

  console.log({ token, amount, currency, id });

  try {
    const user = await User.findById(req.user._id);

    const bootcamp = await Bootcamp.findById(id);

    const newOrder = new Order({
      course: bootcamp._id,
      orderBy: user._id,
      amount: Number(amount) / 100,
      charge: token,
      currency,
      orderStatus: "Delivered",
      method: "Card",
    });

    const order = await newOrder.save();

    //update bootcamp students array
    await Bootcamp.findByIdAndUpdate(id, {
      $push: { students: user._id },
    });

    return res.status(201).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({
      message: "Server Error" + error,
    });
  }
};

//@ DESC GET All orders for Admin
//@ ROUTE /api/order/myorders
//@ access login Admin
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).populate("orderBy");

    if (!orders.length) {
      return res.status(404).json({
        success: false,
        message: "There is not  any Orders yet.",
      });
    }

    return res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      error: "Server error: " + error.message,
    });
  }
};

//@ DESC GET All orders for student
//@ ROUTE /api/order/myorders
//@ access login user
exports.studentOrders = async (req, res) => {
  try {
    const studentOrders = await Order.find({ orderBy: req.user._id }).populate(
      "name"
    );

    if (!studentOrders.length) {
      return res.status(404).json({
        success: false,
        message: "You don't have any Order yet.",
      });
    }

    return res.status(200).json({
      success: true,
      data: studentOrders,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error: " + error.message,
    });
  }
};

//@ DESC GET one order for student
//@ ROUTE /api/order/:bootcampId
//@ access login user
exports.ViewOrder = async (req, res) => {
  const { id } = req.params;

  try {
    let course;

    if (
      id === "Front End Half Time Plan" ||
      id === "Front End Full Time Plan" ||
      id === "Full Stack Half Time Plan" ||
      id === "Full Stack Full Time Plan" ||
      id === "bill" ||
      id.includes("subscription")
    ) {
      course = id;
    } else {
      const bootcamp = await Bootcamp.findById(id);
      const service = await Service.findById(id);

      if (bootcamp && bootcamp.name) {
        course = bootcamp.name;
      }

      if (service && service.name) {
        course = service.name;
      }
    }

    const order = await Order.findOne({
      course,
      orderBy: req.user._id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "You don't have any Order yet.",
      });
    }

    return res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error: " + error.message,
    });
  }
};

//@ DESC GET/POST verify order
//@ ROUTE /api/order/push/bootcampid
//@ access public
exports.PushOrder = async (req, res) => {
  const { data } = req.body;
  const { bootcampId, userId } = req.params;
  const bootcamp = await Bootcamp.findById(bootcampId);

  try {
    // check if the order already creted before !!
    const order = await Order.findOne({ course: bootcampId, orderBy: userId });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "No order found!",
      });
    }

    // update the order status of verified
    await order.updateOne({ orderStatus: "Verified" });
    // respone with 200
    return res.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server Error" + error,
    });
  }
};
