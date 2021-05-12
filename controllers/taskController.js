const Task = require('../models/taskModel')
const { validationResult } = require('express-validator')
const User = require('../models/userModel')
const Week = require('../models/weekModel')
const Answer = require('../models/answerModel')
const Bootcamp = require('../models/bootcampModel')
const { checkIfStudentValid } = require('../util/checkStudentValidity')

const fs = require('fs')
const { sendMail } = require('../middleware/snedMail')

//@ DESC GET posts
//@ ROUTE /api/posts

exports.getTasks = async (req, res) => {
  try {
    //check the bootcamp exists
    const bootcamp = await Bootcamp.findById(req.params.bootcampId)

    if (!bootcamp) {
      return res.status(404).json({
        success: false,
        message: 'No Bootcamp found!'
      })
    }

    let tasks

    //check if the student is enrolled in the bootcamp
    if (req.user.user_type === 'StudentUser') {
      const isValidStudent = await checkIfStudentValid(bootcamp, req.user._id)

      if (!isValidStudent) {
        return res.status(404).json({
          success: false,
          message: 'Student is not enrolled in this bootcamp'
        })
      }

      tasks = await Task.find({ bootcamp: bootcamp._id }).populate('user name')
    }

    //check if is the mentor for the bootcamp
    if (req.user.user_type === 'MentorUser') {
      if (!req.user._id.equals(bootcamp.mentor)) {
        return res.status(404).json({
          success: false,
          message: 'You are not allowed mentor for this bootcamp'
        })
      }
      tasks = await Task.find({ bootcamp: bootcamp._id }).populate('user name')
    }

    //check if is the mentor for the bootcamp
    if (req.user.user_type === 'AdminUser') {
      tasks = await Task.find({ bootcamp: bootcamp._id }).populate('user name')
    }

    if (tasks.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No task found!'
      })
    }

    return res.status(200).json({
      success: true,
      data: tasks
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      message: error
    })
  }
}

//@ DESC POST A NEW post
//@ ROUTE /api/posts
exports.new = async (req, res) => {
  const errors = validationResult(req)
  const AssignmentFile = req.file
  const { AssignmentLink } = req.body

  // check if the file here
  if (!AssignmentFile)
    return res.status(400).json({
      success: false,
      message: 'Please Upload PDF File Maximum 64M Bytes'
    })

  //console.log(`req.body ${req.body}`.green);
  if (!errors.isEmpty()) {
    console.log(errors.array())
    return res.status(422).json({
      success: false,
      message: errors.array()[0].msg
    })
  }

  try {
    //check the bootcamp exists
    const bootcamp = await Bootcamp.findById(req.params.bootcampId)

    if (!bootcamp) {
      return res.status(404).json({
        success: false,
        message: 'No Bootcamp found!'
      })
    }

    //Check if mentor is assigned to the bootcamp
    if (
      req.user.user_type === 'MentorUser' &&
      !req.user._id.equals(bootcamp.mentor)
    ) {
      return res.status(404).json({
        success: false,
        message: 'You are not allowed mentor for this bootcamp'
      })
    }

    //check the week exists
    const week = await Week.findById(req.params.weekId)

    if (!week) {
      return res.status(404).json({
        success: false,
        message: 'No week found!'
      })
    }

    const { description, AssignmentName } = req.body
    const task = new Task({
      description,
      projectName: AssignmentName,
      path: AssignmentFile.path,
      user: req.user._id,
      bootcamp: bootcamp._id,
      week: week._id
    })
    await task.save()

    // get the userIds
    const lastTask = await Task.findOne({
      description,
      projectName: AssignmentName,
      path: AssignmentFile.path,
      user: req.user._id,
      bootcamp: bootcamp._id,
      week: week._id
    })

    //create empty answers for each student of this bootcamp for that quiz
    for (student of bootcamp.students) {
      const user = await User.findOne(student._id)
      //craete the answers
      const answer = new Answer({
        user: user._id,
        task: lastTask._id
      })

      await answer.save()

      //send email to the mentor (submited Answer) .............>
      const toUser = { email: user.email, name: user.name }
      const subjet =
        'New Assignment:Was Created "' + task.projectName + '" Assignment'
      const html = {
        student: '',
        text: 'We want to inform you that a new assignment has been added ',
        assignment: ' ' + task.projectName + ' Assignment.<br>',
        link: 'http://batch22server.ccab.tech/assignment/' + task._id
      }

      var mailStatus = sendMail(res, toUser, subjet, html)
    }

    if (mailStatus) return res.status(201).json({ success: true, data: task })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: 'Server Error' + error
    })
  }
}

// @ DESC GET A SPECEFIC transaction
// @ ROUTE /api/transactions/
exports.view = async (req, res) => {
  try {
    //check the bootcamp exists
    const bootcamp = await Bootcamp.findById(req.params.bootcampId)

    if (!bootcamp) {
      return res.status(404).json({
        success: false,
        message: 'No Bootcamp found!'
      })
    }

    //check if the student is enrolled in the bootcamp
    if (req.user.user_type === 'StudentUser') {
      const isValidStudent = await checkIfStudentValid(bootcamp, req.user._id)

      if (!isValidStudent) {
        return res.status(404).json({
          success: false,
          message: 'Student is not enrolled in this bootcamp'
        })
      }
    }

    //Check if mentor is assigned to the bootcamp
    if (
      req.user.user_type === 'MentorUser' &&
      !req.user._id.equals(bootcamp.mentor)
    ) {
      return res.status(404).json({
        success: false,
        message: 'You are not allowed mentor for this bootcamp'
      })
    }

    /* //check the week exists
    const week = await Week.findById(req.params.weekId)

    if (!week) {
      return res.status(404).json({
        success: false,
        message: 'No week found!'
      })
    } */

    const task = await Task.findOne({
      _id: req.params.id,
      bootcamp: bootcamp._id
    }).populate('user name')

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'No task found!'
      })
    }
    return res.status(200).json({
      success: true,
      task
    })
  } catch (error) {
    console.log(error.message)
    res.status(500).json({
      message: 'server Error' + error
    })
  }
}

exports.userTask = async (req, res) => {
  try {
    // find the Tranaction based on user
    const task = await Task.find({ user: req.user._id })
      .populate('user', 'name email')
      .sort('createdAt')
    if (!task) {
      return res.status(404).json({
        message: 'No task found!'
      })
    }
    res.json(task)
  } catch (error) {
    console.log('Server Error ' + error.message)
    res.status(500).json({
      message: 'Server Error ' + error
    })
  }
}

//@ DESC DElete A post
//@ ROUTE /api/posts:/id
exports.delete = async (req, res) => {
  try {
    const bootcamp = await Bootcamp.findById(req.params.bootcampId)

    if (!bootcamp) {
      return res.status(404).json({
        success: false,
        message: 'No Bootcamp found!'
      })
    }

    //Check if mentor is assigned to the bootcamp
    if (
      req.user.user_type === 'MentorUser' &&
      !req.user._id.equals(bootcamp.mentor)
    ) {
      return res.status(404).json({
        success: false,
        message: 'You are not allowed mentor for this bootcamp'
      })
    }

    const task = await Task.findOne({
      _id: req.params.id,
      bootcamp: bootcamp._id
    })
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'No task found!'
      })
    }

    // get all answers for this task
    const allAnswers = await Answer.find({ task: task._id })

    //delete the answers files if it exist
    for (answer of allAnswers) {
      //console.log('answer'+answer);
      if (answer.path)
        //delete the file from the Server storage
        fs.unlinkSync(answer.path)
    }
    //console.log('task.path'+task.path);
    //delete the task file
    fs.unlinkSync(task.path)

    //delete all answers
    if (allAnswers.length) await Answer.deleteMany({ task: task._id })
    //delete the task
    await Task.deleteOne({ _id: task._id })

    res.status(200).json({
      success: true,
      message: 'Task succefully removed!'
    })
  } catch (error) {
    console.log(error.message)
    res.status(500).json({
      message: 'Server Error' + error
    })
  }
}

exports.studentTasks = async (req, res) => {
  try {
    const enrolledBootcamps = await Bootcamp.find({ students: req.user._id })

    const studentTasks = await Task.find(
      { bootcamp: { $in: enrolledBootcamps } },
      function (err, result) {
        result.map(function (document) {
          return document.value
        })
      }
    )
      .populate('user', 'name email')
      .populate('bootcamp', 'name')

    if (!studentTasks.length) {
      return res.status(404).json({
        success: false,
        error: "You don't have any Task yet."
      })
    }

    return res.status(200).json({
      success: true,
      data: studentTasks
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Server error: ' + error.message
    })
  }
}

//@ desc GET Specfic task and getting multi user aginst
//@ route GET/api/taskes/:id/users
//@ access Protected/Admin
exports.usersAnswersToOneTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'No task found!'
      })
    } else {
      task.isPassed = false
    }

    const updatedTask = await task.save()
    res.json(updatedTask)
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: error
    })
  }
}

//@des GET Download assignment file
//@route GET  api/v2/tasks/:id/download
//@accesss Public

exports.downloadFile = async (req, res, next) => {
  try {
    //get the answer id
    const id = req.params.id
    console.log(id)

    // get specific answer from db
    const assignment = await Task.findById(id)

    // check if answer is Not exist
    if (!assignment)
      return res.status(404).json({ success: false, error: 'File Not found' })

    //download the PDF file
    return res.download(assignment.path)
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, error: 'Server Error : ' + err })
  }
}
