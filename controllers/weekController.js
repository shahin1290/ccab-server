const Task = require('../models/taskModel')
const { validationResult } = require('express-validator')
const Week = require('../models/weekModel')
const Day = require('../models/dayModel')
const Bootcamp = require('../models/bootcampModel')
const { checkIfStudentValid } = require('../util/checkStudentValidity')

//********** Validation Result ************

function getValidationResualt(req) {
  const error = validationResult(req)
  if (!error.isEmpty()) return error.array()
  return false
}

//@ DESC GET weeks
//@ ROUTE /api/weeks/:bootcampId
//@ access Protected/Admin, Mentor and Student
exports.getWeeks = async (req, res) => {
  try {
    const { bootcampId } = req.params

    const bootcamp = await Bootcamp.findById(bootcampId)

    const start_date = bootcamp.start_date
    const current_date = new Date()

    const timePeriod = []

    for (let i = 0; i <= bootcamp.weeks; i++) {
      timePeriod.push(start_date.getTime() + 1000 * 60 * 60 * 24 * 7 * [i])
    }

    timePeriod.map(async (item, index) => {
      if (current_date.getTime() > item) {
        await Week.findOneAndUpdate(
          { bootcamp, name: `week${index + 1}` },
          { show: true }
        )
      }
    })

    //find the weeks for the specific bootcamp
    let weeks = await Week.find({ bootcamp: bootcampId }).select('-__v')

    //check if the student is enrolled in the bootcamp
    if (req.user.user_type === 'StudentUser') {
      const isValidStudent = await checkIfStudentValid(bootcampId, req.user._id)

      weeks = await Week.find({ bootcamp: bootcampId, show: true }).select(
        '-__v'
      ).populate('bootcamp')

console.log(weeks);
      if (!isValidStudent && weeks[0].bootcamp.price >0) {
        return res.status(404).json({
          success: false,
          message: 'Student is not enrolled in this bootcamp'
        })
      }
    }

    if (!weeks) {
      return res.status(404).json({
        success: false,
        message: 'No Week found!'
      })
    }

    return res.status(200).json({
      success: true,
      data: weeks
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      message: error
    })
  }
}

//@ DESC POST A NEW week
//@ ROUTE /api/weeks/:bootcampId
//@ access Protected/Admin, Mentor
exports.new = async (req, res) => {
  const errors = getValidationResualt(req)
  if (errors)
    //returning only first error allways
    return res.status(400).json({ success: false, message: errors[0].msg })

  try {
    const bootcamp = await Bootcamp.findById(req.params.bootcampId)

    if (!bootcamp) {
      return res.status(404).json({
        success: false,
        message: 'No bootcamp found!'
      })
    }

    const newWeek = new Week({
      name: req.body.name,
      bootcamp: bootcamp._id
    })

    const week = await newWeek.save()
    if (week) return res.status(201).json({ success: true, data: week })
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
  console.log(req.params);
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

    //check if the week exists for that bootcamp
    let week = await Week.findOne({ _id: weekId, bootcamp: bootcampId })

    //check if the student is enrolled in the bootcamp
    if (req.user.user_type === 'StudentUser') {
      const isValidStudent = await checkIfStudentValid(
        week.bootcamp,
        req.user._id
      )

      week = await Week.findOne({
        _id: weekId,
        bootcamp: bootcampId,
        show: true
      })

      if (!isValidStudent) {
        return res.status(404).json({
          success: false,
          message: 'Student is not enrolled in this bootcamp'
        })
      }
    }

    if (!week) {
      return res.status(404).json({
        success: false,
        message: 'No week found!'
      })
    }

    return res.status(200).json({
      success: true,
      data: week
    })
  } catch (error) {
    console.log(error.message)
    res.status(500).json({
      message: 'server Error' + error
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