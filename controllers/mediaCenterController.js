const { validationResult } = require('express-validator')
const MediaCenter = require('./../models/mediaCenterModel')
const Bootcamp = require('./../models/bootcampModel')
const Week = require('./../models/weekModel')
const Day = require('./../models/dayModel')
const Quiz = require('./../models/quizModel')
const Task = require('./../models/taskModel')
const QuizAnswer = require('./../models/quizAnswerModel')

const fs = require('fs')

//********** Functions ************************************

//********** validation Resault ************

function getValidationResualt(req) {
  const error = validationResult(req)
  if (!error.isEmpty()) return error.array()
  return false
}

//********** is Name exist ************
const isNameExist = async (mediaCenterName) => {
  const mediaCenter = await MediaCenter.find({ name: mediaCenterName })
  if (mediaCenter.length) {
    return true
  }
  return false
}

//********** createNewWeeks  ************
const createNewWeeks = async (updatedMediaCenter) => {
  for (let i = 1; i <= updatedMediaCenter.weeks; i++) {
    const newWeek = new Week({
      name: `week${i}`,
      bootcamp: updatedMediaCenter._id
    })
    await newWeek.save()
  }
}

//********** createNewWeeks  ************
const createNewDays = async (updatedMediaCenter) => {
  for (let i = 1; i <= updatedMediaCenter.weeks; i++) {
    const dayArr = []
    const week = await Week.findOne({
      name: `week${i}`,
      bootcamp: updatedMediaCenter._id
    })

    for (let j = 1; j <= 5; j++) {
      const newDay = new Day({
        name: `day${j}`,
        week: week._id,
        video_path:
          'https://player.vimeo.com/video/243885948?color=ffffff&title=0&byline=0&portrait=0'
      })
      const savedDay = await newDay.save()
      dayArr.push(savedDay._id)
    }
    await Week.findByIdAndUpdate(week._id, { days: dayArr })
  }
}

//********** Functions End************************************

//********** default route ************
//@des Get all mediaCenters for specific account
//@route Get api/v2/mediaCenters
//@accesss private (allow for all users)

exports.getAllMediaCenters = async (req, res, next) => {
  try {
    const pageSize = 6
    const page = Number(req.query.pageNumber) || 1
    const count = await MediaCenter.countDocuments()
    var mediaCenters
    //console.log(req.user);

    console.log('normal user  request')
    if (req.query.pageNumber) {
      mediaCenters = await MediaCenter.find({ published: true })
        .limit(pageSize)
        .skip(pageSize * (page - 1))
        .populate('mentor', 'name _id')
        .populate('students')
    } else {
      mediaCenters = await MediaCenter.find({ published: true })
        .populate('mentor', 'name _id')
        .populate('students')
    }

    if (!mediaCenters.length)
      return res
        .status(404)
        .json({ success: false, message: 'There is No Data Found' })

    return res.status(200).json({
      success: true,
      count: mediaCenters.length,
      data: { mediaCenters, page, pages: Math.ceil(count / pageSize) }
    })
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: 'Server Error' + err })
  }
}

//@des Get all mediaCenters as admin
//@route Get api/v2/mediaCenters/mange
//@accesss private (allow for all users)
exports.mangeMediaCenter = async (req, res, next) => {
  try {
    const pageSize = 10
    const page = Number(req.query.pageNumber) || 1
    const count = await MediaCenter.countDocuments()
    var mediaCenters
    //console.log(req.user);

    console.log('Admin user  request')
    mediaCenters = await MediaCenter.find()
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .populate('mentor', 'name _id')

    if (!mediaCenters.length)
      return res
        .status(404)
        .json({ success: false, message: 'There is No Data Found' })

    return res.status(200).json({
      success: true,
      count: mediaCenters.length,
      data: { mediaCenters, page, pages: Math.ceil(count / pageSize) }
    })
  } catch (err) {
    console.log(err)
    return res
      .status(500)
      .json({ success: false, message: 'Server Error' + err })
  }
}

//@des POST new MediaCenter for specific account
//@route POST api/v2/mediaCenters
//@accesss private (allow for all users)
exports.newMediaCenter = async (req, res, next) => {
  try {
    const errors = getValidationResualt(req)
    if (errors.length)
      //returning only first error allways
      return res.status(400).json({ success: false, message: errors[0].msg })

    const mediaCenters = await MediaCenter.find()

    // default new MediaCenter
    const mediaCenter = new MediaCenter()
    mediaCenter.name = `mediaCenter ${mediaCenters.length + 1}`
    mediaCenter.category = 'Web Development'
    mediaCenter.description =
      'The essence of this board is to provide a high-level overview of your mediaCenter. This is the place to plan and track your progress. '
    mediaCenter.mentor = req.user._id
    mediaCenter.price = 1000
    mediaCenter.seats = 10
    mediaCenter.weeks = req.body.weeks
    mediaCenter.img_path = '/uplods/img.png'
    mediaCenter.video_path = 'https://www.youtube.com/watch?v=C0DPdy98e4c'
    //mediaCenter.created_at =
    const savedmediaCenter = await mediaCenter.save()

    //create weeks and days based on mediaCenter
    await createNewWeeks(savedmediaCenter)
    await createNewDays(savedmediaCenter)

    return res.status(201).json({
      success: true,
      data: savedmediaCenter
    })
  } catch (err) {
    console.log(err)
    return res
      .status(500)
      .json({ success: false, message: 'Server Error' + err })
  }
}

//@des GET single mediaCenter for specific account
//@route GET api/mediaCenter/:id
//@accesss private (allow for Admin)
exports.mediaCenterDetails = async (req, res) => {
  try {
    const id = req.params.id
    const mediaCenter = await MediaCenter.findOne({
      _id: id
    })
      .populate('mentor', 'name _id')
      .populate('students')

    if (!mediaCenter) {
      return res
        .status(404)
        .json({ success: false, message: 'mediaCenter is not found' })
    }

    return res.status(200).json({
      success: true,
      data: mediaCenter
    })
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: 'Server error: ' + err })
  }
}

//@des PUT Update single mediaCenter for specific account
//@route PUT api/v2/mediaCenter/:id
//@accesss private (allow for Admin)
exports.updateMediaCenter = async function (req, res) {
  try {
    const errors = getValidationResualt(req)
    if (errors.length)
      //returning only first error allways
      return res.status(400).json({ success: false, message: errors[0].msg })

    const id = req.params.id
    const mediaCenter = await MediaCenter.findById(id)

    let update = req.body

    if (req.body.students) {
      update = { ...update, students: JSON.parse(req.body.students) }

      //if new student is added, create all previous quiz and task answers
      const newStudetArray = JSON.parse(req.body.students).filter(
        (x) => mediaCenter.students.indexOf(x) === -1
      )
      const Quizzess = await Quiz.find({ mediaCenter })

      if (Quizzess.length > 0) {
        for (student of newStudetArray) {
          Quizzess.forEach(async (quiz) => {
            //craete the answers
            const quizAnswer = new QuizAnswer({
              user: student,
              quiz: quiz._id
            })

            await quizAnswer.save()
          })
        }
      }

      const tasks = await Task.find({ mediaCenter })

      if (tasks.length > 0) {
        for (student of newStudetArray) {
          tasks.forEach(async (task) => {
            //craete the answers
            const answer = new Answer({
              user: student,
              answer: answer._id
            })

            await answer.save()
          })
        }
      }
    }

    if (req.body.info_list) {
      update = { ...update, info_list: req.body.info_list }
    }

    if (req.file) {
      update = { ...update, img_path: req.file.filename }
    }

    const updatedMediaCenter = await MediaCenter.findOneAndUpdate(
      { _id: id },
      update,
      {
        new: true
      }
    )

    if (updatedMediaCenter) {
      if (updatedMediaCenter.weeks !== mediaCenter.weeks) {
        // 1 delete week and day content for that mediaCenter
        // 2 delete the image_path upload files for the mediaCenter
        // 3 delete video path and element_text image file uploads from day

        const weekNumberChanges = updatedMediaCenter.weeks - mediaCenter.weeks

        if (weekNumberChanges < 0) {
          for (let i = 0; i < weekNumberChanges * -1; i++) {
            const week = await Week.findOneAndDelete({
              name: `week${mediaCenter.weeks - i}`
            })

            const days = await Day.find({ week: week._id })

            await Day.deleteMany({ week: week._id })

            days.forEach(async (day) => {
              //fs.unlinkSync(day.video_path)

              //check if day contains any image reference
              const imageElemntArr = day.source_code.filter(
                (item) => item.element_type === 'image'
              )

              //remove image from public folder
              if (imageElemntArr.length > 0) {
                imageElemntArr.forEach((el) => fs.unlinkSync(el.element_text))
              }
            })
          }
        }

        if (weekNumberChanges > 0) {
          for (let i = 1; i <= weekNumberChanges; i++) {
            const week = new Week({
              name: `week${mediaCenter.weeks + i}`,
              mediaCenter: updatedMediaCenter._id
            })

            await week.save()

            const dayArr = []

            for (let j = 1; j <= 5; j++) {
              const newDay = new Day({
                name: `day${j}`,
                week: week._id,
                video_path:
                  'https://player.vimeo.com/video/243885948?color=ffffff&title=0&byline=0&portrait=0'
              })
              const savedDay = await newDay.save()
              dayArr.push(savedDay._id)
            }

            await Week.findByIdAndUpdate(week._id, { days: dayArr })
          }
        }
      }

      //update all the courses of the mediaCenter
      if (mediaCenter.courses && mediaCenter.courses.length > 0) {
        mediaCenter.courses.forEach(async (course) => {
          await Bootcamp.findByIdAndUpdate(course, update)
        })
      }
    }
    return res.status(200).json({
      success: true,
      data: updatedMediaCenter
    })
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: 'Server Error : ' + err })
  }
}

//@des DELETE single mediaCenter for specific account
//@route DELETE api/v2/mediaCenter/:id
//@accesss private (allow for Admin)
exports.deleteMediaCenter = async function (req, res) {
  try {
    const { id } = req.params
    const mediaCenter = await MediaCenter.findById(id)

    if (!mediaCenter)
      return res.status(404).json({
        message: "mediaCenter doesn't  Exist In "
      })

    await MediaCenter.deleteOne()

    // 1 delete week and day content for that mediaCenter
    // 2 delete the image_path upload files for the mediaCenter
    // 3 delete video path and element_text image file uploads from day

    const weeks = await Week.find({ mediaCenter: id })

    await Week.deleteMany({ mediaCenter: id })

    weeks.forEach(async (week) => {
      const days = await Day.find({ week: week._id })

      await Day.deleteMany({ week: week._id })

      days.forEach(async (day) => {
        //fs.unlinkSync(day.video_path)

        //check if day contains any image reference

        const imageElemntArr =
          day.source_code &&
          day.source_code.filter((item) => item.element_type === 'image')
        // console.log(imageElemntArr);
        //remove image from public folder
        if (imageElemntArr && imageElemntArr.length) {
          imageElemntArr.forEach((el) =>
            fs.unlinkSync(el.element_text, (err) => {
              console.log(err)
            })
          )
        }
      })
    })

    return res.status(200).json({
      data: null,
      message: 'mediaCenter hase been deleted',
      success: true
    })
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: 'Server Error : ' + err })
  }
}
