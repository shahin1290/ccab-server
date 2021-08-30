const { validationResult } = require('express-validator')
const User = require('../models/userModel')
const Order = require('../models/orderModel')
const Request = require('../models/requestModel')
const Bootcamp = require('../models/bootcampModel')
const Service = require('../models/serviceModel')
const stripe = require('stripe')(process.env.STRIPE_SECRET)
const axios = require('axios')
const { sendMail } = require('../middleware/sendMail')
const { sendSubscriptionMail } = require('../middleware/sendSubscriptionMail')

exports.stripePaymentIntent = async (req, res) => {
  const { paymentMethodType, currency, amount } = req.body

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount),
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

exports.createSubscription = async (req, res) => {
  //find the user if exists
  var user = await User.findById(req.user._id)

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'No user found!'
    })
  }

  try {
    // Create a new customer object
    const customer = await stripe.customers.create({
      email: user.email,
      payment_method: req.body.payment_method,
      invoice_settings: {
        default_payment_method: req.body.payment_method
      }
    })

    //save customer id in user model
    await User.findOneAndUpdate(
      { _id: user._id },
      { stripeCustomerId: customer.id }
    )

    // Create the subscription. Note we're expanding the Subscription's
    // latest invoice and that invoice's payment_intent
    // so we can pass it to the front end to confirm the payment
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [
        {
          plan: req.body.planId
        }
      ],
      expand: ['latest_invoice.payment_intent']
    })

    return res.status(201).json({ success: true, data: subscription })

    /* res.send({
      subscriptionId: subscription.id,
      clientSecret: subscription.latest_invoice.payment_intent.client_secret,
    }); */
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message
    })
  }
}

exports.previewSubscription = async (req, res) => {
  //get stripeCustomerId from user
  const user = await User.findById(req.body.orderBy)
  try {
    const invoice = await stripe.invoices.retrieveUpcoming({
      customer: user.stripeCustomerId
    })

    return res.status(201).json({ success: true, data: invoice })
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message
    })
  }
}

exports.cancelSubscription = async (req, res) => {
  try {
    const deletedSubscription = await stripe.subscriptions.del(
      req.body.subscriptionId
    )

    //update the order status
    if (deletedSubscription.status === 'canceled') {
      await Order.findOneAndUpdate(
        {
          orderBy: req.body.orderBy,
          charge: req.body.subscriptionId
        },
        { orderStatus: 'Canceled' }
      )
    }

    return res.status(201).json({ success: true, data: deletedSubscription })
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message
    })
  }
}

//@ DESC POST A NEW order
//@ ROUTE /api/order/
//@ access login user
exports.createOrder = async (req, res) => {
  const { token, amount, currency } = req.body

  const { id } = req.params

  const user = await User.findById(req.user._id)

  try {
    let course

    if (
      id === 'Silver Plan' ||
      id === 'Golden Plan' ||
      id === 'Diamond Plan' ||
      id === 'bill' ||
      id.includes('subscription')
    ) {
      course = id
    } else {
      const bootcamp = await Bootcamp.findById(id)
      const service = await Service.findById(id)

      if (bootcamp && bootcamp.name) {
        course = bootcamp.name
      }

      if (service && service.name) {
        course = service.name
      }
    }

    let newOrder

    if (id.includes('subscription')) {
      newOrder = new Order({
        course,
        orderBy: user._id,
        amount: Number(amount) / 100,
        charge: token,
        currency,
        orderStatus: 'Active',
        method: 'Card'
      })
    } else {
      newOrder = new Order({
        course,
        orderBy: user._id,
        amount: Number(amount) / 100,
        charge: token,
        currency,
        orderStatus: 'Delivered',
        method: 'Card'
      })
    }

    const order = await newOrder.save()

    //send email to admin
    const admin = await User.findOne({ user_type: 'AdminUser' })

    const toUser = { email: admin.email, name: admin.name }
    const subject = 'New Stripe Order'
    const html = {
      student: '',
      text: 'We want to inform you that a New Stripe order have been made ',
      assignment: order._id && id,
      link: 'https://ccab.tech/profile'
    }

    if (
      (order._id && id === 'Silver Plan') ||
      (order._id && id === 'Golden Plan') ||
      (order._id && id === 'Diamond Plan')
    ) {
      //send mail to admin
      sendMail(res, toUser, subject, html)

      return res.status(201).json({ success: true, data: order })
    } else if (order._id && id.includes('subscription')) {
      //get the customer invoice
      const invoice = await stripe.invoices.retrieveUpcoming({
        customer: user.stripeCustomerId
      })

      const subscription = await stripe.subscriptions.retrieve(order.charge)

      console.log(subscription)

      //send mail to admin
      sendMail(res, toUser, subject, html)

      //send mail to student
      sendSubscriptionMail(res, user, invoice, subscription)

      return res.status(201).json({ success: true, data: order })
    } else if (order._id && id === 'bill') {
      //update bootcamp students array
      await Request.findOneAndUpdate(
        { requestedUser: req.user._id },
        {
          status: 'Paid'
        }
      )
      //send mail to admin
      sendMail(res, toUser, subject, html)

      return res.status(201).json({ success: true, data: order })
    } else {
      //update bootcamp students array
      await Bootcamp.findByIdAndUpdate(id, {
        $push: { students: user._id }
      })

      //send mail to admin
      sendMail(res, toUser, subject, html)

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
    const orders = await Order.find({}).populate('orderBy')

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
  const { id } = req.params

  try {
    let course

    if (
      id === 'Silver Plan' ||
      id === 'Golden Plan' ||
      id === 'Diamond Plan' ||
      id === 'bill' ||
      id.includes('subscription')
    ) {
      course = id
    } else {
      const bootcamp = await Bootcamp.findById(id)
      const service = await Service.findById(id)

      if (bootcamp && bootcamp.name) {
        course = bootcamp.name
      }

      if (service && service.name) {
        course = service.name
      }
    }

    const order = await Order.findOne({
      course,
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

//@ DESC POST A NEW session
//@ ROUTE /api/order/
//@ access login user
exports.createKlarnaSession = async (req, res) => {
  const { data } = req.body

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

    /* // check if the order already creted before !!
    const order = await Order.find({
      course: bootcampId,
      orderBy: req.user._id
    })
    //console.log( order[0].charge);
    if (order.length) {
      // send Get request to Klarna API ( Read the oreder )
      const resp = await axios.get(
        'https://api.klarna.com/checkout/v3/orders/' +
          order[0].charge,
        config
      )
      if (resp)
        return res
          .status(201)
          .json({ success: true, data: JSON.stringify(resp.data) })
    }
 */
    // Create New Order

    const resp = await axios.post(
      'https://api.klarna.com/payments/v1/sessions',
      data,
      config
    )

    if (resp)
      return res
        .status(201)
        .json({ success: true, data: JSON.stringify(resp.data) })
  } catch (error) {
    console.log('error', error)
    res.status(500).json({
      message: 'Server Error' + error
    })
  }
}

//@ DESC GET AN order
//@ ROUTE /api/order/bootcampid/klarna/order
//@ access login user
exports.readKlarnaSession = async (req, res) => {
  const { session_id } = req.body

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

    // send Get request to Klarna API ( Read the session )
    const resp = await axios.get(
      `https://api.klarna.com/payments/v1/sessions/${session_id}`,
      config
    )

    //console.log('responsee', resp.data)

    if (resp)
      return res
        .status(201)
        .json({ success: true, data: JSON.stringify(resp.data) })
  } catch (error) {
    res.status(500).json({
      message: 'Server Error' + error
    })
  }
}

//@ DESC POST A NEW order
//@ ROUTE /api/order/
//@ access login user
exports.createKlarnaOrder = async (req, res) => {
  const { data, token } = req.body

  const bootcampId = req.params.bootcampId

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

    // Create New Order

    const resp = await axios.post(
      `https://api.klarna.com/payments/v1/authorizations/${token}/order`,
      data,
      config
    )

    //save new order
    const user = await User.findById(req.user._id)

    let course

    if (
      bootcampId === 'Silver Plan' ||
      bootcampId === 'Golden Plan' ||
      bootcampId === 'Diamond Plan' ||
      bootcampId === 'bill'
    ) {
      course = bootcampId
    } else {
      const bootcamp = await Bootcamp.findById(bootcampId)
      const service = await Service.findById(bootcampId)

      if (bootcamp && bootcamp.name) {
        course = bootcamp.name
      }

      if (service && service.name) {
        course = service.name
      }
    }

    const newOrder = new Order({
      course,
      orderBy: user._id,
      amount: data.order_amount / 100,
      charge: resp.data.order_id,
      currency: data.purchase_currency,
      method: 'Klarna'
    })

    const order = await newOrder.save()

    //send email to admin
    const admin = await User.findOne({ user_type: 'AdminUser' })

    const toUser = { email: admin.email, name: admin.name }
    const subject = 'New Klarna Order'
    const html = {
      student: '',
      text: 'We want to inform you that a New Klarna order have been made. You need to capture the order',
      assignment: order._id && bootcampId,
      link: 'https://ccab.tech/profile'
    }

    //update bootcamp students array
    if (
      (order._id && bootcampId === 'Silver Plan') ||
      (order._id && bootcampId === 'Golden Plan') ||
      (order._id && bootcampId === 'Diamond Plan')
    ) {
      //send mail to admin
      sendMail(res, toUser, subject, html)

      return res.status(201).json({ success: true, data: order })
    } else if (order._id && bootcampId === 'bill') {
      await Request.findOneAndUpdate(
        { requestedUser: req.user._id },
        {
          status: 'Paid'
        }
      )
      //send mail to admin
      sendMail(res, toUser, subject, html)

      return res.status(201).json({ success: true, data: order })
    } else {
      //update bootcamp students array
      await Bootcamp.findByIdAndUpdate(bootcampId, {
        $push: { students: user._id }
      })

      //update service students array
      await Service.findByIdAndUpdate(bootcampId, {
        $push: { students: user._id }
      })

      //send mail to admin
      sendMail(res, toUser, subject, html)

      return res.status(201).json({ success: true, data: order })
    }
  } catch (error) {
    console.log('error', error.message)
    res.status(500).json({
      message: 'Server Error' + error
    })
  }
}

//@ DESC GET AN order
//@ ROUTE /api/order/bootcampid/klarna/order
//@ access login user
exports.readKlarnaOrder = async (req, res) => {
  const bootcampId = req.params.bootcampId

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
    const order = await Order.findOne({
      _id: bootcampId,
      orderBy: req.user._id
    })

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'No order found!'
      })
    }

    // send Get request to Klarna API ( Read the oreder )
    const resp = await axios.get(
      `https://api.klarna.com/ordermanagement/v1/orders/${order.charge}`,
      config
    )

    if (resp.data.fraud_status == 'ACCEPTED') {
      await order.updateOne({ orderStatus: 'Verified' })
    }

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

//@ DESC GET/POST verify order
//@ ROUTE /api/order/push/bootcampid
//@ access public
exports.PushOrder = async (req, res) => {
  const { data } = req.body
  const { bootcampId, userId } = req.params
  const bootcamp = await Bootcamp.findById(bootcampId)

  try {
    // check if the order already creted before !!
    const order = await Order.findOne({ course: bootcampId, orderBy: userId })

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'No order found!'
      })
    }

    // update the order status of verified
    await order.updateOne({ orderStatus: 'Verified' })
    // respone with 200
    return res.status(200).json({ success: true })
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
    const order = await Order.findOne({
      course: bootcampId,
      orderBy: req.body.orderBy
    })

    const amount = Math.round(order.amount)

    // send acknowled order
    const resp = await axios.post(
      `https://api.klarna.com/ordermanagement/v1/orders/${order.charge}/captures`,
      { captured_amount: amount },
      config
    )
    //console.log("acknowledge : ", resp );

    if (order) {
      // update the order status of verified
      await order.updateOne({ orderStatus: 'Delivered' })
    }
    return res.status(200).json({ success: true })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: 'Server Error' + error
    })
  }
}
