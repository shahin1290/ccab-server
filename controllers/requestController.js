const { validationResult } = require('express-validator')
const Request = require('../models/requestModel')
const User = require('../models/userModel')
const { sendRequestPaymentMail } = require('../util/requestPaymentMail')

//********** Validation Result ************

function getValidationResualt(req) {
  const error = validationResult(req)
  if (!error.isEmpty()) return error.array()
  return false
}

//@ DESC GET weeks
//@ ROUTE /api/weeks/:bootcampId
//@ access Protected/Admin, Mentor and Student
exports.getRequests = async (req, res) => {
  try {
    let requests

    if (
      req.user.user_type === 'AdminUser' ||
      req.user.user_type === 'AccountantUser'
    ) {
      requests = await Request.find().populate(
        'requestedUser',
        'name email _id'
      )
    }

    if (req.user.user_type === 'StudentUser') {
      requests = await Request.find({ requestedUser: req.user._id }).populate(
        'requestedUser',
        'name email _id'
      )
    }

    if (requests.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No Request Bill found!'
      })
    }

    if (requests.length)
      return res.status(201).json({ success: true, data: requests })
  } catch (error) {
    res.status(500).json({
      message: 'Server Error' + error
    })
  }
}

//@ DESC POST A NEW week
//@ ROUTE /api/weeks/:bootcampId
//@ access Protected/Admin, Mentor
exports.new = async (req, res) => {
  const { name, price, selectedStudent, currency, status, expiryDate } =
    req.body
  try {
    const user = await User.findOne({ email: selectedStudent })
    const newRequest = new Request({
      name,
      amount: price,
      requestedUser: user._id,
      status,
      currency,
      expireAt: expiryDate
    })

    const request = await newRequest.save()

    sendRequestPaymentMail(user.name, user.email)
    if (request) return res.status(201).json({ success: true, data: request })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: 'Server Error' + error
    })
  }
}

// @ DESC GET A SPECEFIC week
// @ ROUTE /api/weeks/bootcampId/:weekId
//@ access Protected/Admin, Mentor and Student
exports.view = async (req, res) => {
  const { id } = req.params
  try {
    const request = await Request.findById(id).populate(
      'requestedUser',
      'name email _id'
    )

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'No request found!'
      })
    }

    return res.status(201).json({ success: true, data: request })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: 'Server Error' + error
    })
  }
}

//@ DESC UPDATE A week
// @ ROUTE /api/weeks/:bootcampId/:weekId
//@ access Protected/Admin and mentor
exports.update = async (req, res) => {
  
  try {
    const { id } = req.params

    const updatedRequest = await Request.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    })

    return res.status(200).json({
      success: true,
      data: updatedRequest
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: error
    })
  }
}

//@ DESC DELETE A week
// @ ROUTE /api/weeks/:bootcampId/:weekId
//@ access Protected by Admin, mentor
exports.delete = async (req, res) => {
  try {
    const { id } = req.params

    //delete the week
    const request = await Request.deleteOne({ _id: id })

    res.status(200).json({
      success: true,
      message: request.name + ' is deleted'
    })
  } catch (error) {
    console.log(error.message)
    res.status(500).json({
      message: error
    })
  }
}
