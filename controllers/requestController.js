const { validationResult } = require('express-validator')
const Request = require('../models/requestModel')
const User = require('../models/userModel')

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

    console.log(await Request.findOne({ requestedUser: req.user._id }))

    if (req.user.user_type === 'AdminUser') {
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

    if (requests.length)
      return res.status(201).json({ success: true, data: requests })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: 'Server Error' + error
    })
  }
}

//@ DESC POST A NEW week
//@ ROUTE /api/weeks/:bootcampId
//@ access Protected/Admin, Mentor
exports.new = async (req, res) => {
  const { name, price, selectedStudent } = req.body
  try {
    const user = await User.findOne({ email: selectedStudent })
    const newRequest = new Request({
      name,
      amount: price,
      requestedUser: user._id,
      status: 'Sent'
    })

    const request = await newRequest.save()
    if (request) return res.status(201).json({ success: true, data: request })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: 'Server Error' + error
    })
  }
}

//@ DESC UPDATE weeks show for specific bootcamp
// @ ROUTE /api/weeks/:bootcampId
//@ access Protected/Admin, mentor and student
exports.updateWeekShow = async (req, res) => {
  console.log(req.params)
  try {
    const { bootcampId } = req.params

    //check if bootcamp exists
    const bootcamp = await Bootcamp.findById(bootcampId)
    if (!bootcamp) {
      return res.status(404).json({
        success: false,
        message: 'No bootcamp found!'
      })
    }

    const start_date = bootcamp.start_date
    const current_date = new Date()

    const timePeriod = []

    for (let i = 0; i <= bootcamp.weeks; i++) {
      timePeriod.push(start_date.getTime() + 1000 * 60 * 60 * 24 * 7 * [i])
    }

    timePeriod.map(async (item, index) => {
      if (current_date.getTime() > item) {
        await Week.findOneAndUpdate(
          { name: `week${index + 1}` },
          { show: true }
        )
      }
    })

    const weeks = await Week.find({ bootcamp: bootcamp._id, show: true })

    if (weeks.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No week found!'
      })
    }

    return res.status(200).json({
      success: true,
      data: weeks
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: error
    })
  }
}

// @ DESC GET A SPECEFIC week
// @ ROUTE /api/weeks/bootcampId/:weekId
//@ access Protected/Admin, Mentor and Student
exports.view = async (req, res) => {
  const { id } = req.params
  try {
    const request = await Request.findById(id)

    console.log('r', id);

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
  const errors = getValidationResualt(req)
  if (errors)
    //returning only first error allways
    return res.status(400).json({ success: false, message: errors[0].msg })

  try {
    const { weekId, bootcampId } = req.params

    //check if bootcamp exists
    const bootcamp = await Bootcamp.findById(bootcampId)
    if (!bootcamp) {
      return res.status(404).json({
        success: false,
        message: 'No bootcamp found!'
      })
    }

    //check if is the mentor for the bootcamp
    if (
      req.user.user_type === 'MentorUser' &&
      !req.user._id.equals(bootcamp.mentor)
    ) {
      return res.status(404).json({
        success: false,
        message: 'You are not allowed mentor for this bootcamp'
      })
    }

    //check if the week exists
    const week = await Week.findById(weekId)

    if (!week) {
      return res.status(404).json({
        success: false,
        message: 'No week found!'
      })
    }

    //update the week
    const { name } = req.body

    const updatedWeek = await Week.findByIdAndUpdate(
      week._id,
      { name },
      {
        new: true,
        runValidators: true
      }
    )

    return res.status(200).json({
      success: true,
      data: updatedWeek
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
    const { weekId, bootcampId } = req.params

    //check if bootcamp exists
    const bootcamp = await Bootcamp.findById(bootcampId)
    if (!bootcamp) {
      return res.status(404).json({
        success: false,
        message: 'No bootcamp found!'
      })
    }

    //check if is the mentor for the bootcamp
    if (
      req.user.user_type === 'MentorUser' &&
      !req.user._id.equals(bootcamp.mentor)
    ) {
      return res.status(404).json({
        success: false,
        message: 'You are not allowed mentor for this bootcamp'
      })
    }

    //check if the week exists
    const week = await Week.findById(weekId)

    if (!week) {
      return res.status(404).json({
        success: false,
        message: 'No week found!'
      })
    }

    //delete the week
    await week.remove()

    //delete all the days for that week
    await Day.deleteMany({ week: weekId })

    res.status(200).json({
      success: true,
      message: week.name + ' is deleted'
    })
  } catch (error) {
    console.log(error.message)
    res.status(500).json({
      message: error
    })
  }
}
