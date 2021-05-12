const { validationResult } = require('express-validator')
const QuizAnswer = require('../models/quizAnswerModel')
const Bootcamp = require('../models/bootcampModel')
const Quiz = require('../models/quizModel')
const { checkIfStudentValid } = require('../util/checkStudentValidity')

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

//********** Calculate Result ************
const calculateResult = (quiz, answers) => {
  let answerArr = []
  for (const a of quiz.question) {
    const trueAnswers = a.answers.find((b) => b.correct === true)
    answerArr.push({ question: a.content, answer: trueAnswers.content })
  }

  let resultArr = []
  for (const a of answerArr) {
    for (const b of answers) {
      resultArr.push(JSON.stringify(b) === JSON.stringify(a))
    }
  }

  const noOfQuestions = quiz.question.length
  const noOfCorrectAnswers = resultArr.filter(Boolean).length

  const percentageOfAccuracy = (noOfCorrectAnswers / noOfQuestions) * 100
  if (percentageOfAccuracy >= 95) {
    return 'Excellent'
  }
  if (percentageOfAccuracy >= 75 && percentageOfAccuracy < 95) {
    return 'Good'
  }
  if (percentageOfAccuracy >= 60 && percentageOfAccuracy < 75) {
    return 'Not Bad'
  }
  if (percentageOfAccuracy < 60) {
    return 'Failed'
  }
}

//********** Functions End************************************
//@des GET all quizAnswers for specific quiz
//@route GET api/quiz/quizAnswers
//@accesss private (allow for all admin mentor)

exports.getAllQuizAnswers = async (req, res, next) => {
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
    const quiz = await Quiz.findOne({
      bootcamp: bootcamp._id,
      _id: req.params.quizId
    })

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'No Quiz found!'
      })
    }

    let quizAnswers

    //check if the student is enrolled in the bootcamp
    if (req.user.user_type === 'StudentUser') {
      const isValidStudent = await checkIfStudentValid(bootcamp, req.user._id)

      if (!isValidStudent) {
        return res.status(404).json({
          success: false,
          message: 'Student is not enrolled in this bootcamp'
        })
      }

      quizAnswers = await QuizAnswer.find({
        quiz: quiz._id,
        user: req.user._id
      }).populate('user name')
    }

    //check if is the mentor for the bootcamp
    if (req.user.user_type === 'MentorUser') {
      if (!req.user._id.equals(bootcamp.mentor)) {
        return res.status(404).json({
          success: false,
          message: 'You are not allowed mentor for this bootcamp'
        })
      }
      quizAnswers = await QuizAnswer.find({ quiz: quiz._id }).populate(
        'user name'
      )
    }

    //check if is the admin
    if (req.user.user_type === 'AdminUser') {
      quizAnswers = await QuizAnswer.find({ quiz: quiz._id }).populate(
        'user name'
      )
    }

    if (quizAnswers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No quiz answer found!'
      })
    }

    return res.status(200).json({
      success: true,
      count: quizAnswers.length,
      data: quizAnswers
    })
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Server Error' + err })
  }
}

//get myquize for student
exports.getMyQizzeAnswer = async (req, res, next) => {
  try {
    const quizzAnswer = await QuizAnswer.find({ _id: req.user._id })
    if (!quizzAnswer.length) {
      return res.status(404).json({
        success: false,
        message: 'No Quiz found!'
      })
    }

    return res.status(200).json({
      success: true,
      count: quizzAnswer.length
    })
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Server Error' + err })
  }
}

/* //@des POST new quizAnswer
//@route POST api/quizId/quizAnswer
//@accesss private (allow for students)
exports.newQuizAnswer = async (req, res, next) => {
  const errors = getValidationResualt(req)
  if (errors)
    //returning only first error allways
    return res.status(400).json({ success: false, message: errors[0].msg })

  try {
    const newQuizAnswer = new QuizAnswer({
      ...req.body,
      user: req.user._id,
      quiz: req.params.quizId
    })

    const quizAnswer = await newQuizAnswer.save()
    if (quizAnswer)
      return res.status(201).json({ success: true, data: quizAnswer })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: 'Server Error' + error
    })
  }
} */

//@des GET single quizAnswer for specific account
//@route GET api/quizAnswer/:id
//@accesss private (allow for Admin, mentor and student)
exports.quizAnswerDetails = async (req, res) => {
  try {
    const { id, quizId, bootcampId } = req.params

    const bootcamp = await Bootcamp.findById(bootcampId)

    if (!bootcamp) {
      return res.status(404).json({
        success: false,
        message: 'No Bootcamp found!'
      })
    }

    //find the quiz
    const quiz = await Quiz.findOne({
      bootcamp: bootcamp._id,
      _id: quizId
    })

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'No Quiz found!'
      })
    }

    let quizAnswer

    //check if the student is enrolled in the bootcamp
    if (req.user.user_type === 'StudentUser') {
      const isValidStudent = await checkIfStudentValid(bootcamp, req.user._id)

      if (!isValidStudent) {
        return res.status(404).json({
          success: false,
          message: 'Student is not enrolled in this bootcamp'
        })
      }

      quizAnswer = await QuizAnswer.findOne({
        _id: id,
        quiz: quiz._id,
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
      quizAnswer = await QuizAnswer.findOne({ _id: id, quiz: quiz._id })
    }

    //check if is the admin
    if (req.user.user_type === 'AdminUser') {
      quizAnswer = await QuizAnswer.findOne({ _id: id, quiz: quiz._id })
    }

    if (!quizAnswer) {
      return res.status(404).json({
        success: false,
        message: 'No quiz answer found!'
      })
    }

    return res.status(200).json({
      success: true,
      data: quizAnswer
    })
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, error: 'Server error: ' + err })
  }
}

//@des PUT Update single quizAnswer for specific quiz
//@route PUT api/quizAnswer/:quizId/:id
//@accesss private (allow for Admin, Mentor)
exports.updateQuizAnswer = async function (req, res) {
  try {
    const { quizId, bootcampId } = req.params

    const bootcamp = await Bootcamp.findById(bootcampId)

    if (!bootcamp) {
      return res.status(404).json({
        success: false,
        message: 'No Bootcamp found!'
      })
    }

    //find the quiz
    const quiz = await Quiz.findOne({
      bootcamp: bootcamp._id,
      _id: quizId
    }).populate('question.answers')

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'No Quiz found!'
      })
    }

    let updatedQuizAnswer

    //check if the student is enrolled in the bootcamp
    if (req.user.user_type === 'StudentUser') {
      const isValidStudent = await checkIfStudentValid(bootcamp, req.user._id)

      if (!isValidStudent) {
        return res.status(404).json({
          success: false,
          message: 'Student is not enrolled in this bootcamp'
        })
      }

      updatedQuizAnswer = await QuizAnswer.findOneAndUpdate(
        {
          quiz: quiz._id,
          user: req.user._id
        },
        {
          answers: req.body,
          status: calculateResult(quiz, req.body)
        }
      )
    }

    //send email to the student (graded Answer) .............>
    const toUser = {
      email: updatedQuizAnswer.user.email,
      name: updatedQuizAnswer.user.name
    }
    const subjet =
      'New grade: is updated in ' + updatedQuizAnswer.quiz.name + ' Quiz'
    const html = {
      student: '',
      text: 'We want to inform you that your quiz has been graded in ',
      quiz:
        ' ' +
        updatedQuizAnswer.quiz.name +
        ' assignment.<br><br> <b>You can Check the new grade by logging in to your profile OR Click below!</b>',
      link: 'http://batch22server.ccab.tech/profile'
    }
    const mailStatus = sendMail(res, toUser, subjet, html)

    if (mailStatus)
      return res.status(200).json({
        success: true,
        data: {
          quizAnswer: updatedQuizAnswer,
          status: calculateResult(quiz, req.body)
        }
      })
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, error: 'Server Error : ' + err })
  }
}

//@des DELETE single bootcamp for specific account
//@route DELETE api/v2/bootcamp/:id
//@accesss private (allow for Admin)
exports.deleteQuizAnswer = async function (req, res) {
  try {
    const { id, quizId, bootcampId } = req.params

    const bootcamp = await Bootcamp.findById(bootcampId)

    if (!bootcamp) {
      return res.status(404).json({
        success: false,
        message: 'No Bootcamp found!'
      })
    }

    //find the quiz
    const quiz = await Quiz.findOne({
      bootcamp: bootcamp._id,
      _id: quizId
    })

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'No Quiz found!'
      })
    }

    const quizAnswer = await QuizAnswer.findOne({
      _id: id,
      quiz: quiz._id
    })
    if (!QuizAnswer)
      return res.status(404).json({
        error: "QuizAnswer Doesn't  Exist "
      })

    await quizAnswer.deleteOne()

    return res.status(200).json({
      data: null,
      message: 'QuizAnswer hase been deleted',
      success: true
    })
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, error: 'Server Error : ' + err })
  }
}

// Get students Dashboard asnwer list
//@ DESC get my answer
//@ ROUTE /api/answers/myanswers
exports.studentQuizAnswers = async (req, res) => {
  console.log(req.user._id)
  try {
    const quizAnswers = await QuizAnswer.find({
      user: req.user._id
    })

    if (!quizAnswers.length) {
      return res.status(404).json({
        success: false,
        message: 'No Answer Found.'
      })
    }

    return res.status(200).json({
      success: true,
      count: quizAnswers.length,
      data: quizAnswers
    })
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Server Error' + err })
  }
}
