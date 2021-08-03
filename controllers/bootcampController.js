const { validationResult } = require('express-validator')
const Bootcamp = require('./../models/bootcampModel')
const MediaCenter = require('./../models/mediaCenterModel')
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
const isNameExist = async (bootcampName) => {
  const bootcamp = await Bootcamp.find({ name: bootcampName })
  if (bootcamp.length) {
    return true
  }
  return false
}

//********** createNewWeeks  ************
const createNewWeeks = async (updatedBootcamp) => {
  for (let i = 1; i <= updatedBootcamp.weeks; i++) {
    const newWeek = new Week({
      name: `week${i}`,
      bootcamp: updatedBootcamp._id
    })
    await newWeek.save()
  }
}

//********** createNewWeeks  ************
const createNewDays = async (updatedBootcamp, mediaCenter) => {
  for (let i = 1; i <= updatedBootcamp.weeks; i++) {
    const dayArr = []
    const week = await Week.findOne({
      name: `week${i}`,
      bootcamp: updatedBootcamp._id
    })

    const centerWeek = await Week.findOne({
      name: `week${i}`,
      bootcamp: mediaCenter._id
    })

    const centerDays = await Day.find({ week: centerWeek._id })

    centerDays.forEach(async (centerDay) => {
      const newDay = new Day({
        name: centerDay.name,
        week: week._id,
        video_path: centerDay.video_path,
        show: centerDay.show,
        arabic_video_path: centerDay.arabic_video_path,
        sections: centerDay.sections
      })
      const savedDay = await newDay.save()

      dayArr.push(savedDay._id)
    })

    await Week.findByIdAndUpdate(week._id, { days: dayArr })
  }
}

//********** Functions End************************************

//********** default route ************
//@des Get all bootcamps for specific account
//@route Get api/v2/bootcamps
//@accesss private (allow for all users)

exports.getAllBootcamps = async (req, res, next) => {
  try {
    const pageSize = 6
    const page = Number(req.query.pageNumber) || 1
    const count = await Bootcamp.countDocuments()
    var bootcamps
    //console.log(req.user);

    console.log('normal user  request')
    if (req.query.pageNumber) {
      bootcamps = await Bootcamp.find({ published: true })
        .limit(pageSize)
        .skip(pageSize * (page - 1))
        .populate('mentor', 'name _id')
        .populate('students')
    } else {
      bootcamps = await Bootcamp.find({ published: true })
        .populate('mentor', 'name _id')
        .populate('students')
    }

    if (!bootcamps.length)
      return res
        .status(404)
        .json({ success: false, message: 'There is No Data Found' })

    return res.status(200).json({
      success: true,
      count: bootcamps.length,
      data: { bootcamps, page, pages: Math.ceil(count / pageSize) }
    })
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: 'Server Error' + err })
  }
}

//@des Get all bootcamps as admin
//@route Get api/v2/bootcamps/mange
//@accesss private (allow for all users)
exports.MangeBootcamp = async (req, res, next) => {
  try {
    const pageSize = 10
    const page = Number(req.query.pageNumber) || 1
    const count = await Bootcamp.countDocuments()
    var bootcamps
    //console.log(req.user);

    console.log('Admin user  request')
    bootcamps = await Bootcamp.find()
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .populate('mentor', 'name _id')

    if (!bootcamps.length)
      return res
        .status(404)
        .json({ success: false, message: 'There is No Data Found' })

    return res.status(200).json({
      success: true,
      count: bootcamps.length,
      data: { bootcamps, page, pages: Math.ceil(count / pageSize) }
    })
  } catch (err) {
    console.log(err)
    return res
      .status(500)
      .json({ success: false, message: 'Server Error' + err })
  }
}

//@des POST new bootcamp for specific account
//@route POST api/v2/bootcamps
//@accesss private (allow for all users)
exports.newBootcamp = async (req, res, next) => {
  try {
    const errors = getValidationResualt(req)
    if (errors.length)
      //returning only first error allways
      return res.status(400).json({ success: false, message: errors[0].msg })

    const mediaCenter = await MediaCenter.findById(req.body.mediaCenter)

    const {
      name,
      category,
      description,
      mentor,
      price,
      seats,
      weeks,
      img_path,
      video_path
    } = mediaCenter

    // default new bootcamp
    const bootcamp = new Bootcamp()

    bootcamp.name = name
    bootcamp.category = category
    bootcamp.description = description
    bootcamp.price = price
    bootcamp.seats = seats
    bootcamp.weeks = weeks
    bootcamp.img_path = img_path
    bootcamp.video_path = video_path
    bootcamp.mentor = mentor

    const savedbootcamp = await bootcamp.save()

    //update bootcamp's end date based on weeks
    const updatedBootcamp = await Bootcamp.findByIdAndUpdate(
      savedbootcamp._id,
      {
        end_date:
          savedbootcamp.start_date.getTime() +
          1000 * 60 * 60 * 24 * 7 * savedbootcamp.weeks
      }
    )

    //create weeks and days based on bootcamp
    await createNewWeeks(updatedBootcamp)
    await createNewDays(updatedBootcamp, mediaCenter)

    //update media center courses array
    const updatedMediaCenter = await MediaCenter.findByIdAndUpdate(
      mediaCenter._id,
      {
        courses: [...mediaCenter.courses, updatedBootcamp._id]
      },
      { new: true }
    )

    //add all quizzes and tasks to all courses of the media center
    const quizzes = await Quiz.find({ bootcamp: mediaCenter._id })
    const tasks = await Task.find({ bootcamp: mediaCenter._id })
    const allCourses = updatedMediaCenter.courses

    if (tasks.length > 0) {
      for (const task of tasks) {
        const mediaDay = await Day.findOne({ _id: task.day })

        const mediaWeek = await Week.findOne({ days: mediaDay._id })

        allCourses.forEach(async (course) => {
          const week = await Week.findOne({
            name: mediaWeek.name,
            bootcamp: course._id
          })

          const day = await Day.findOne({ name: mediaDay.name, week: week._id })

          const newTask = new Task({
            description: task.description,
            projectName: task.projectName,
            path: task.path,
            user: task.user,
            bootcamp: course._id,
            day: day._id
          })
          await newTask.save()
        })
      }
    }

    if (quizzes.length > 0) {
      for (const quiz of quizzes) {
        const mediaDay = await Day.findOne({ _id: quiz.day })

        const mediaWeek = await Week.findOne({ days: mediaDay._id })

        allCourses.forEach(async (course) => {
          const week = await Week.findOne({
            name: mediaWeek.name,
            bootcamp: course._id
          })

          const day = await Day.findOne({ name: mediaDay.name, week: week._id })

          const newQuiz = new Quiz({
            description: quiz.description,
            name: quiz.name,
            question: quiz.question,
            user: quiz.user,
            bootcamp: course._id,
            day: day._id,
            time: quiz.time
          })
          await newQuiz.save()
        })
      }
    }

    return res.status(201).json({
      success: true,
      data: {
        _id: updatedBootcamp._id,
        name: updatedBootcamp.name,
        created_at: Bootcamp.getDate(updatedBootcamp.createdAt),
        description: updatedBootcamp.description,
        account_id: updatedBootcamp.account_id
      }
    })
  } catch (err) {
    console.log(err)
    return res
      .status(500)
      .json({ success: false, message: 'Server Error' + err })
  }
}

//@des GET single bootcamp for specific account
//@route GET api/bootcamp/:id
//@accesss private (allow for Admin)
exports.bootcampDetails = async (req, res) => {
  try {
    const id = req.params.id
    const bootcamp = await Bootcamp.findOne({
      _id: id
    })
      .populate('mentor', 'name _id')
      .populate('students')

    if (!bootcamp) {
      return res
        .status(404)
        .json({ success: false, message: 'bootcamp is not found' })
    }

    return res.status(200).json({
      success: true,
      data: bootcamp
    })
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: 'Server error: ' + err })
  }
}

//@des PUT Update single bootcamp for specific account
//@route PUT api/v2/bootcamp/:id
//@accesss private (allow for Admin)
exports.updateBootcamp = async function (req, res) {
  try {
    const errors = getValidationResualt(req)
    if (errors.length)
      //returning only first error allways
      return res.status(400).json({ success: false, message: errors[0].msg })

    const id = req.params.id
    const bootcamp = await Bootcamp.findById(id)

    let update = req.body

    if (req.body.students) {
      update = { ...update, students: JSON.parse(req.body.students) }

      //if new student is added, create all previous quiz and task answers
      const newStudetArray = JSON.parse(req.body.students).filter(
        (x) => bootcamp.students.indexOf(x) === -1
      )
      const Quizzess = await Quiz.find({ bootcamp })

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

      const tasks = await Task.find({ bootcamp })

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

    const updatedBootcamp = await Bootcamp.findOneAndUpdate(
      { _id: id },
      update,
      {
        new: true
      }
    )

    if (updatedBootcamp) {
      await Bootcamp.findByIdAndUpdate(updatedBootcamp._id, {
        end_date:
          updatedBootcamp.start_date.getTime() +
          1000 * 60 * 60 * 24 * 7 * updatedBootcamp.weeks
      })
      if (updatedBootcamp.weeks !== bootcamp.weeks) {
        // 1 delete week and day content for that bootcamp
        // 2 delete the image_path upload files for the bootcamp
        // 3 delete video path and element_text image file uploads from day

        const weekNumberChanges = updatedBootcamp.weeks - bootcamp.weeks

        if (weekNumberChanges < 0) {
          for (let i = 0; i < weekNumberChanges * -1; i++) {
            const week = await Week.findOneAndDelete({
              name: `week${bootcamp.weeks - i}`
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
              name: `week${bootcamp.weeks + i}`,
              bootcamp: updatedBootcamp._id
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

        /* //create weeks and days based on bootcamp
        await createNewWeeks(updatedBootcamp)
        await createNewDays(updatedBootcamp) */
      }
    }
    return res.status(200).json({
      success: true,
      data: updatedBootcamp
    })
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: 'Server Error : ' + err })
  }
}

//@des DELETE single bootcamp for specific account
//@route DELETE api/v2/bootcamp/:id
//@accesss private (allow for Admin)
exports.deleteBootcamp = async function (req, res) {
  try {
    const { id } = req.params
    const bootcamp = await Bootcamp.findById(id)

    if (!bootcamp)
      return res.status(404).json({
        message: "bootcamp doesn't  Exist In "
      })

    await bootcamp.deleteOne()

    // 1 delete week and day content for that bootcamp
    // 2 delete the image_path upload files for the bootcamp
    // 3 delete video path and element_text image file uploads from day

    const weeks = await Week.find({ bootcamp: id })

    await Week.deleteMany({ bootcamp: id })

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
      message: 'bootcamp hase been deleted',
      success: true
    })
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: 'Server Error : ' + err })
  }
}
