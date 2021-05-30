const { validationResult } = require('express-validator')
const User = require('../models/userModel')
const Order = require('../models/orderModel')
const Bootcamp = require('../models/bootcampModel')
const stripe = require('stripe')(process.env.STRIPE_SECRET)
const axios = require('axios')
//********** Validation Result ************

function getValidationResualt(req) {
  const error = validationResult(req)
  if (!error.isEmpty()) return error.array()
  return false
}

exports.stripePaymentIntent = async (req, res) => {
  const { paymentMethodType, currency, amount } = req.body

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      payment_method_types: [paymentMethodType]
    })

    // Send publishable key and PaymentIntent details to client
    res.status(200).send(paymentIntent.client_secret)
  } catch (e) {
    return res.status(400).send({
      error: {
        message: e.message
      }
    })
  }
}

//@ DESC POST A NEW order
//@ ROUTE /api/order/
//@ access login user
exports.createOrder = async (req, res) => {
  const { token, amount } = req.body

  const bootcamp = await Bootcamp.findById(req.params.bootcampId)

  try {
    const user = await User.findById(req.user._id)

    const newOrder = new Order({
      course: bootcamp._id,
      orderBy: user._id,
      amount: amount,
      charge: token,
      currency: 'USD',
      orderStatus: 'Delivered',
      method: 'Card'
    })

    const order = await newOrder.save()

    if (order) {
      //update bootcamp students array
      await Bootcamp.findByIdAndUpdate(order.course, {
        $push: { students: user._id }
      })

      return res.status(201).json({ success: true, data: order })
    }
  } catch (error) {
    res.status(500).json({
      message: 'Server Error' + error
    })
  }
}

//@ DESC GET All orders for Admin
//@ ROUTE /api/order/myorders
//@ access login Admin
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('course', 'name')
      .populate('orderBy')

    if (!orders.length) {
      return res.status(404).json({
        success: false,
        message: 'There is not  any Orders yet.'
      })
    }

    return res.status(200).json({
      success: true,
      data: orders
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      success: false,
      error: 'Server error: ' + error.message
    })
  }
}

//@ DESC GET All orders for student
//@ ROUTE /api/order/myorders
//@ access login user
exports.studentOrders = async (req, res) => {
  try {
    const studentOrders = await Order.find({ orderBy: req.user._id }).populate(
      'course',
      'name'
    )

    if (!studentOrders.length) {
      return res.status(404).json({
        success: false,
        message: "You don't have any Order yet."
      })
    }

    return res.status(200).json({
      success: true,
      data: studentOrders
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    })
  }
}

//@ DESC GET one order for student
//@ ROUTE /api/order/:bootcampId
//@ access login user
exports.ViewOrder = async (req, res) => {
  const { bootcampId } = req.params


  try {
    const bootcamp = await Bootcamp.findById(bootcampId)

    const order = await Order.findOne({
      course: bootcamp._id,
      orderBy: req.user._id
    })

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "You don't have any Order yet."
      })
    }

    return res.status(200).json({
      success: true,
      data: order
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    })
  }
}

//@ DESC POST A NEW order
//@ ROUTE /api/order/
//@ access login user
exports.createKlarnaOrder = async (req, res) => {
  const { data } = req.body
  const bootcampId = req.params.bootcampId
  const bootcamp = await Bootcamp.findById(bootcampId)

  try {
    const config = {
      withCredentials: true,
      auth: {
        username: process.env.REACT_APP_USERNAME,
        password: process.env.REACT_APP_PASS
      },
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Credentials': true
      }
    }

    // check if the order already creted before !!
    const order = await Order.find({
      course: bootcampId,
      orderBy: req.user._id
    })
    //console.log( order[0].charge);
    if (order.length) {
      // send Get request to Klarna API ( Read the oreder )
      const resp = await axios.get(
        'https://api.playground.klarna.com/checkout/v3/orders/' +
          order[0].charge,
        config
      )
      if (resp)
        return res
          .status(201)
          .json({ success: true, data: JSON.stringify(resp.data) })
    }

    // Create New Order

    const resp = await axios.post(
      'https://api.playground.klarna.com/checkout/v3/orders/',
      data,
      config
    )

    const user = await User.findById(req.user._id)
    console.log(resp.data)
    const newOrder = new Order({
      course: bootcamp._id,
      orderBy: user._id,
      amount: resp.data.order_amount / 100,
      charge: resp.data.order_id,
      currency: resp.data.purchase_currency,
      method: 'Klarna'
    })

    await newOrder.save()

    //update bootcamp students array
    await Bootcamp.findByIdAndUpdate(order.course, {
      $push: { students: user._id }
    })

    if (resp)
      return res
        .status(201)
        .json({ success: true, data: JSON.stringify(resp.data) })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: 'Server Error' + error
    })
  }
}

//@ DESC GET AN order
//@ ROUTE /api/order/bootcampid/klarna/order
//@ access login user
exports.ReadKlarnaOrder = async (req, res) => {
  const { data } = req.body
  const bootcampId = req.params.bootcampId
  const bootcamp = await Bootcamp.findById(bootcampId)

  try {
    const config = {
      withCredentials: true,
      auth: {
        username: process.env.REACT_APP_USERNAME,
        password: process.env.REACT_APP_PASS
      },
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Credentials': true
      }
    }

    // check if the order already creted before !!
    const order = await Order.find({
      course: bootcampId,
      orderBy: req.user._id
    })
    console.log(order[0].charge)
    if (order.length) {
      // send Get request to Klarna API ( Read the oreder )
      const resp = await axios.get(
        'https://api.playground.klarna.com/checkout/v3/orders/' +
          order[0].charge,
        config
      )
      console.log(resp.data)
      if (resp.data.status == 'checkout_complete') {
        await order[0].updateOne({ orderStatus: 'Processed' })
      }

      if (resp)
        return res
          .status(201)
          .json({ success: true, data: JSON.stringify(resp.data) })
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: 'Server Error' + error
    })
  }
}

//@ DESC GET/POST verify order
//@ ROUTE /api/order/push/bootcampid
//@ access public
exports.PushOrder = async (req, res) => {
  const { data } = req.body
  const { bootcampId, userId } = req.params
  const bootcamp = await Bootcamp.findById(bootcampId)

  try {
    // check if the order already creted before !!
    const order = await Order.find({ course: bootcampId, orderBy: userId })
    // console.log( order[0].charge);
    if (order.length) {
      // update the order status of verified
      await order[0].updateOne({ orderStatus: 'Verified' })
      console.log('Verified')
      // respone with 200
      return res.status(200).json({ success: true })
    }
    console.log('ids : ', bootcampId, userId)
    return res.status(404).json({ success: false })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: 'Server Error' + error
    })
  }
}

//@ DESC GET/POST capture order
//@ ROUTE /api/order/capture/bootcampid
//@ access public
exports.captureOrder = async (req, res) => {
  const { bootcampId } = req.params
  const bootcamp = await Bootcamp.findById(bootcampId)

  try {
    const config = {
      withCredentials: true,
      auth: {
        username: process.env.REACT_APP_USERNAME,
        password: process.env.REACT_APP_PASS
      },
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Credentials': true
      }
    }

    // check if the order already creted before !!
    const order = await Order.find({
      course: bootcampId,
      orderBy: req.user._id
    })

    // send acknowled order
    const resp = await axios.post(
      `https://api.playground.klarna.com/ordermanagement/v1/orders/${order[0].charge}/acknowledge`,
      {},
      config
    )
    //console.log("acknowledge : ", resp );

    if (order.length) {
      // update the order status of verified
      await order[0].updateOne({ orderStatus: 'Delivered' })
      console.log('Delivered')
    }
    console.log('ids : ', bootcampId)
    return res.status(200).json({ success: true })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: 'Server Error' + error
    })
  }
}
