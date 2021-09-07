const { validationResult } = require('express-validator')
const fs = require('fs')
const Day = require('../models/dayModel')
const DailyActivity = require('../models/dailyActivityModel')
const Bootcamp = require('../models/bootcampModel')
const { checkIfStudentValid } = require('../util/checkStudentValidity')

//********** Validation Result ************
function getValidationResualt(req) {
  const error = validationResult(req)
  if (!error.isEmpty()) return error.array()
  return false
}

//@ DESC GET All Days
//@ ROUTE /api/content/:weekId
//@ access Protected/Student
exports.getAllDailyActivities = async (req, res) => {
  try {
    const dailyActivity = await DailyActivity.findOne({
      bootcamp: req.params.bootcampId,
      student: req.user._id
    })
      .populate('watchingLectures.lecture')
      .populate('watchingLectures.week')

    if (!dailyActivity) {
      return res.status(404).json({
        success: false,
        message: 'No Activity found!'
      })
    }

    return res.status(200).json({
      success: true,
      data: dailyActivity.watchingLectures
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      message: error
    })
  }
}

//@ DESC POST A NEW day
//@ ROUTE /api/content/:weekId
//@ access Protected/Admin
exports.newDailyAcivity = async (req, res) => {
  try {
    //see first if the daily activity is already available for the user

    const start = new Date().setHours(0, 0, 0, 0)
    const end = new Date().setHours(23, 59, 59, 999)
    /* createdAt: { $gte: start, $lt: end } */

    const dailyActivity = await DailyActivity.findOne({
      student: req.user._id
    })

    if (!dailyActivity) {
      const newDailyActivity = new DailyActivity({
        watchingLectures: [
          {
            lecture: req.body.dayId,
            duration: req.body.duration,
            week: req.body.weekId
          }
        ],
        student: req.user._id,
        bootcamp: req.params.bootcampId
      })

      const savedDailyActivity = await newDailyActivity.save()

      if (savedDailyActivity)
        res.status(201).json({
          success: true,
          data: savedDailyActivity
        })
    } else {
      //check if the video is already saved

      /* const savedDailyActivity = await DailyActivity.findOne({
        'watchingLectures.lecture': req.body.dayId,
        student: req.user._id
      }) */

      const updatedDailyActivity = await DailyActivity.findOneAndUpdate(
        {
          student: req.user._id
        },
        {
          watchingLectures: [
            ...dailyActivity.watchingLectures,
            {
              lecture: req.body.dayId,
              duration: req.body.duration,
              week: req.body.weekId
            }
          ]
        }
      )

      if (updatedDailyActivity)
        res.status(201).json({
          success: true,
          data: updatedDailyActivity
        })
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: 'Server Error' + error
    })
  }
}

// @ DESC GET A SPECEFIC day
// @ ROUTE /api/content/:weekId/:id
//@ access Protected/Student
exports.view = async (req, res) => {
  const { weekId, id } = req.params

  try {
    //check if the week exists
    const week = await Week.findById(weekId).populate(
      'bootcamp',
      'mentor price'
    )
    if (!week) {
      return res.status(404).json({
        success: false,
        message: 'No Week found!'
      })
    }

    let day

    //check if the student is enrolled in the bootcamp
    if (req.user.user_type === 'StudentUser') {
      const isValidStudent = await checkIfStudentValid(
        week.bootcamp,
        req.user._id
      )

      if (!isValidStudent && week.bootcamp.price > 0) {
        return res.status(404).json({
          success: false,
          message: 'Student is not enrolled in this bootcamp'
        })
      }
      day = await Day.findOne({ _id: id, show: true })
    }

    //check if is the mentor for the bootcamp
    if (req.user.user_type === 'MentorUser') {
      if (!req.user._id.equals(week.bootcamp.mentor)) {
        return res.status(404).json({
          success: false,
          message: 'You are not allowed mentor for this bootcamp'
        })
      }
      day = await Day.findOne({ _id: id })
    }

    //check if is the mentor for the bootcamp
    if (req.user.user_type === 'AdminUser') {
      day = await Day.findOne({ _id: id })
    }

    if (!day) {
      return res.status(404).json({
        success: false,
        message: 'No day found!'
      })
    }

    //check if the day is in the week

    if (!day.week.equals(weekId)) {
      return res.status(404).json({
        success: false,
        message: 'The day is not found in that week'
      })
    }

    return res.status(200).json({
      success: true,
      data: day
    })
  } catch (error) {
    console.log(error.message)
    res.status(500).json({
      message: 'server Error' + error
    })
  }
}

//@ DESC UPDATE A day
// @ ROUTE /api/content/:weedId/:id
//@ access Protected/Admin
exports.updateDailyAcivity = async (req, res) => {
  try {
    const dailyActivity = await DailyActivity.findOne({
      'watchingLectures.lecture': req.body.dayId,
      student: req.user._id
    })

    if (!dailyActivity) {
      return res.status(404).json({
        success: false,
        message: 'No DailyActivity found!'
      })
    }

    const updateddailyActivity = await DailyActivity.findOneAndUpdate(
      {
        _id: dailyActivity._id
      },
      { $set: { 'watchingLectures.$[el].endDate': new Date() } },

      {
        arrayFilters: [{ 'el.lecture': req.body.dayId }],
        new: true
      }
    )

    return res.status(200).json({
      success: true,
      data: updateddailyActivity
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: error
    })
  }
}

//@ DESC DELETE A day
// @ ROUTE /api/content/:weekId/days:id
//@ access Protected/Admin
exports.delete = async (req, res) => {
  const { weekId, id } = req.params
  try {
    //check if the week exists
    const week = await Week.findById(weekId).populate('bootcamp', 'mentor')
    if (!week) {
      return res.status(404).json({
        success: false,
        message: 'No Week found!'
      })
    }

    //check if is the mentor for the bootcamp
    if (
      req.user.user_type === 'MentorUser' &&
      !req.user._id.equals(week.bootcamp.mentor)
    ) {
      return res.status(404).json({
        success: false,
        message: 'You are not allowed mentor for this bootcamp'
      })
    }

    //check if the day is in the week
    const day = await Day.findById(id)

    if (!day) {
      return res.status(404).json({
        success: false,
        message: 'No day found!'
      })
    }

    if (!day.week.equals(weekId)) {
      return res.status(404).json({
        success: false,
        message: 'The day is not found in that week'
      })
    }

    //delete the day
    await day.remove()

    //remove video from public folder
    fs.unlinkSync(day.video_path)

    //check if day contains any image reference
    const imageElemntArr = day.source_code.filter(
      (item) => item.element_type === 'image'
    )

    //remove image from public folder
    if (imageElemntArr.length > 0) {
      imageElemntArr.forEach((el) => fs.unlinkSync(el.element_text))
    }

    res.status(200).json({
      success: true,
      message: day.name + ' is deleted'
    })
  } catch (error) {
    console.log(error.message)
    res.status(500).json({
      message: error
    })
  }
}
