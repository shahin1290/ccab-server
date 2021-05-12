const Answer = require('../models/answerModel')
const { validationResult } = require('express-validator')
const { sendMail } = require('../middleware/snedMail')
const Bootcamp = require('../models/bootcampModel')
const { checkIfStudentValid } = require('../util/checkStudentValidity')
const Task = require('../models/taskModel')

//********** Validation Result ************
function getValidationResualt(req) {
  const error = validationResult(req)
  if (!error.isEmpty()) return error.array()
  return false
}

//@ DESC PUT an answer
//@ ROUTE /api/answers/:id
exports.addNewAnswer = async (req, res) => {
  try {
    //There is another route for admin or mentor to update answer status
    if (
      req.user.user_type === 'MentorUser' ||
      req.user.user_type === 'AdminUser'
    ) {
      return res.status(404).json({
        success: false,
        message:
          'There is another route for admin or mentor to update answer status'
      })
    }

    const myfile = req.file

    const { AssignmentLink } = req.body

    const errors = getValidationResualt(req)
    if (errors)
      //returning only first error allways
      return res.status(400).json({ success: false, message: errors[0].msg })

    const { taskId, bootcampId } = req.params

    const bootcamp = await Bootcamp.findById(bootcampId)

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

    //find the task
    const task = await Task.findOne({
      bootcamp: bootcamp._id,
      _id: taskId
    })

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'No Task found!'
      })
    }

    // check if the file here
    if (!myfile)
      return res.status(400).json({
        success: false,
        message: 'Please Upload File Type Of (Zip) Maximum 64M Bytes'
      })

    const answer = await Answer.findOne({ task: taskId, user: req.user._id })
      .populate({ path: 'task', populate: { path: 'user' } })
      .populate('user')

    if (!answer)
      return res
        .status(404)
        .json({ success: false, message: 'Answer Does Not Exist' })

    answer.assignmentLink = AssignmentLink
    answer.path = myfile.path
    answer.isSend = true
    answer.status = 'Sent'
    answer.createdAt = Date.now()

    await answer.save()
    console.log('Answer :..' + answer)
    //send email to the mentor (submited Answer) .............>
    const toUser = {
      email: answer.task.user.email,
      name: answer.task.user.name
    }
    const subjet =
      'New Answer:was submited to ' + answer.task.projectName + ' Assignment'
    const html = {
      student: req.user.name,
      text: 'has submited the ',
      assignment: ' ' + answer.task.projectName + ' assignment.<br>',
      link:
        'http://batch22server.ccab.tech/admin/taskdetails/' + answer.task._id
    }
    const mailStatus = sendMail(res, toUser, subjet, html)

    if (mailStatus)
      return res
        .status(200)
        .json({ success: true, message: 'Your Answer Has Been Sent.' })
  } catch (error) {
    console.log('Server Error' + error)
    return res.status(500).json({
      success: false,
      message: 'Server Error' + error.message
    })
  }
}

//@des GET Download answer file
//@route GET  api/v2/answer/:id/download
//@accesss Public
exports.downloadFile = async (req, res, next) => {
  try {
    //get the answer id
    const id = req.params.id

    // get specific answer from db
    const answer = await Answer.findById(id)

    // check if answer is Not exist
    if (!answer)
      return res.status(404).json({ success: false, message: 'File Not found' })

    if (req.user.user_type === 'MentorUser' || req.user.user_type === 'AdminUser')
      // set the isViewed to true;
      await answer.updateOne({ isViewed: true, status: 'Pending' })

    //download the PDF file
    return res.download(answer.path)
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: 'Server Error : ' + err })
  }
}

//@ DESC GET all answer for specific task
//@ ROUTE /api/answers/:id
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

    //find the quiz
    const task = await Task.findOne({
      bootcamp: bootcamp._id,
      _id: req.params.taskId
    })

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'No Task found!'
      })
    }

    let answers

    //check if the student is enrolled in the bootcamp
    if (req.user.user_type === 'StudentUser') {
      const isValidStudent = await checkIfStudentValid(bootcamp, req.user._id)

      if (!isValidStudent) {
        return res.status(404).json({
          success: false,
          message: 'Student is not enrolled in this bootcamp'
        })
      }

      answers = await Answer.find({
        task: task._id,
        user: req.user._id
      })
    }

    //check if is the mentor for the bootcamp
    if (req.user.user_type === 'MentorUser') {
      if (!req.user._id.equals(bootcamp.mentor)) {
        return res.status(404).json({
          success: false,
          message: 'You are not allowed mentor for this bootcamp'
        })
      }
      answers = await Answer.find({ task: task._id }).populate('user','name')
    }

    //check if is the admin
    if (req.user.user_type === 'AdminUser') {
      console.log('getting answers for Admin ');
      answers = await Answer.find({ task: task._id }).populate('user','name')
    }

    if (!answers.length) {
      return res.status(404).json({
        success: false,
        message: 'answer is not found'
      })
    }

    return res.status(200).json({
      success: true,
      data: answers
    })
  } catch (error) {
    console.log('Server error: ' + error.message)
    return res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    })
  }
}

//@ DESC GET specific answer
//@ ROUTE /api/answers/:id
exports.viewOne = async (req, res) => {
  try {
    const { id, bootcampId, taskId } = req.params

    const bootcamp = await Bootcamp.findById(bootcampId)

    if (!bootcamp) {
      return res.status(404).json({
        success: false,
        message: 'No Bootcamp found!'
      })
    }

    //find the task
    const task = await Task.findOne({
      bootcamp: bootcamp._id,
      _id: taskId
    })

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'No Task found!'
      })
    }

    let answer

    //check if the student is enrolled in the bootcamp
    if (req.user.user_type === 'StudentUser') {
      const isValidStudent = await checkIfStudentValid(bootcamp, req.user._id)

      if (!isValidStudent) {
        return res.status(404).json({
          success: false,
          message: 'Student is not enrolled in this bootcamp'
        })
      }

      answer = await Answer.findOne({
        _id: id,
        task: task._id,
        user: req.user._id
      })
    }

    //check if is the mentor for the bootcamp
    if (req.user.user_type === 'MentorUser') {
      if (!req.user._id.equals(bootcamp.mentor)) {
        return res.status(404).json({
          success: false,
          message: 'You are not allowed mentor for this bootcamp'
        })
      }
      answer = await answer.findOne({ _id: id, task: task._id })
    }

    //check if is the admin
    if (req.user.user_type === 'AdminUser') {
      answer = await Answer.findOne({ _id: id, task: task._id })
    }

    if (!answer) {
      return res
        .status(404)
        .json({ success: false, message: 'answer is not found' })
    }

    return res.status(200).json({
      success: true,
      data: answer
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    })
  }
}

// Get students Dashboard asnwer list
//@ DESC get my answer
//@ ROUTE /api/answers/myanswers
exports.studentAnswers = async (req, res) => {
  try {
    const answers = await Answer.find({ user: req.user._id }).populate('task')
    //console.log('in');
    if (!answers.length) {
      return res.status(404).json({
        success: false,
        message: 'No Assignment Found.'
      })
    }

    return res.status(200).json({
      success: true,
      answers
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    })
  }
}

// Get All Answers
// exports.getAllAnswers = async (req, res) => {
//   try {
//     const answers = await Answer.find({}).populate("user", "name");

//     if (!answers) {
//       return res.status(404).json({
//         success: false,
//         error: "answers is not found",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       data: answers,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       error: "Server error: " + error.message,
//     });
//   }
// };

//@ DESC DElete A post
//@ ROUTE /api/answers:/id
exports.delete = async (req, res) => {
  try {
    const { id, taskId, bootcampId } = req.params

    const bootcamp = await Bootcamp.findById(bootcampId)

    if (!bootcamp) {
      return res.status(404).json({
        success: false,
        message: 'No Bootcamp found!'
      })
    }

    //find the task
    const task = await task.findOne({
      bootcamp: bootcamp._id,
      _id: taskId
    })

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'No task found!'
      })
    }

    const answer = await Answer.findOne({
      _id: id,
      task: task._id
    })
    if (!answer)
      return res.status(404).json({
        error: "Answer Doesn't  Exist "
      })

    await answer.deleteOne()

    res.status(200).json({
      success: true,
      message: 'answer succefully removed!'
    })
  } catch (error) {
    console.log(error.message)
    return res.status(500).json({
      message: error
    })
  }
}

//@ DESC asnwer Status as Mentor
//@ ROUTE /api/answers/:id
exports.updateAnswerStatus = async (req, res) => {
  try {
    //There is another route for student
    if (req.user.user_type === 'StudentUser') {
      return res.status(404).json({
        success: false,
        message: 'There is another route for student'
      })
    }

    const { id, taskId, bootcampId } = req.params

    const bootcamp = await Bootcamp.findById(bootcampId)

    if (!bootcamp) {
      return res.status(404).json({
        success: false,
        message: 'No Bootcamp found!'
      })
    }

    //find the task
    const task = await Task.findOne({
      bootcamp: bootcamp._id,
      _id: taskId
    })

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'No task found!'
      })
    }

    let answer

    //check if is the mentor for the bootcamp
    if (req.user.user_type === 'MentorUser') {
      if (!req.user._id.equals(bootcamp.mentor)) {
        return res.status(404).json({
          success: false,
          message: 'You are not allowed mentor for this bootcamp'
        })
      }
      answer = await Answer.findOneAndUpdate(
        {
          _id: id,
          task: task._id
        },
        { status: req.body.status }
      )
        .populate('user')
        .populate('task')
    }

    //check if is the admin
    if (req.user.user_type === 'AdminUser') {
      answer = await Answer.findOneAndUpdate(
        { _id: id, task: task._id },
        { status: req.body.status }
      )
        .populate('user')
        .populate('task')
    }

    if (!answer)
      return res
        .status(404)
        .json({ success: false, message: 'No answer found!' })

    //send email to the student (graded Answer) .............>
    const toUser = { email: answer.user.email, name: answer.user.name }
    const subjet =
      'New grade: is updated in ' + answer.task.projectName + ' Assignment'
    const html = {
      student: '',
      text: 'We want to inform you that your assignment has been graded in ',
      assignment:
        ' ' +
        answer.task.projectName +
        ' assignment.<br><br> <b>You can Check the new grade by logging in to your profile OR Click below!</b>',
      link: 'http://batch22server.ccab.tech/profile'
    }
    const mailStatus = sendMail(res, toUser, subjet, html)

    if (mailStatus)
      return res.status(200).json({ success: true, answer: answer })
  } catch (error) {
    return res.status(500).json({ message: 'Server Error' + error })
  }
}
