const Performance = require('../models/performanceModel')
const Day = require('../models/dayModel')
const Bootcamp = require('../models/bootcampModel')
const Quiz = require('../models/quizModel')
const Task = require('../models/taskModel')
const User = require('../models/userModel')
const QuizAnswer = require('../models/quizAnswerModel')

//********** default route ************

//@des Get all Performance for specific account
//@route Get api/v2/Performance
//@accesss private (allow for all users)

exports.getAllPerformances = async (req, res, next) => {
  try {
    let performances

    console.log('ddd', req.params.userId)

    const user = await User.findById(req.params.userId)

    if (req.user.user_type === 'AdminUser') {
      performances = await Performance.find({
        student: user._id,
        bootcamp: req.params.bootcampId
      })
    }

    if (req.user.user_type === 'StudentUser') {
      performances = await Performance.find({
        student: user._id,
        bootcamp: req.params.bootcampId
      })
        .sort({ createdAt: 'asc' })
        .populate('student', 'name _id')
    }

    if (!performances.length)
      return res
        .status(404)
        .json({ success: false, message: 'There is No Data Found' })

    return res.status(200).json({
      success: true,
      data: performances
    })
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: 'Server Error' + err })
  }
}

//@des Get all Watching Lectures as student
//@route Get api/performance/watching-lectures
//@accesss private (allow for all users)
exports.watchingLectures = async (req, res, next) => {
  try {
    const performances = await Performance.find({
      bootcamp: req.params.bootcampId,
      student: req.user._id
    })

    if (!performances.length)
      return res
        .status(404)
        .json({ success: false, message: 'There is No Data Found' })

    //find all the watching lectures for the bootcamp

    let watchingLectures = []

    performances.forEach((performance) => {
      return (watchingLectures = [
        ...watchingLectures,
        ...performance.watchingLectures
      ])
    })

    const filteredArray = watchingLectures.filter(function (item, pos) {
      return watchingLectures.indexOf(item) == pos
    })

    if (!watchingLectures.length)
      return res
        .status(404)
        .json({ success: false, message: 'No lectures are watched yet ' })

    return res.status(200).json({
      success: true,
      data: [...new Set(watchingLectures)]
    })
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: 'Server Error' + err })
  }
}

//@des POST new Performance for specific account
//@route POST api/v2/Performance
//@accesss private (allow for all users)
exports.newPerformance = async (req, res, next) => {
  try {
    const newPerformance = new Performance({
      student: req.user._id
    })
    const performance = await newPerformance.save()

    return res.status(201).json({
      success: true,
      data: performance
    })
  } catch (err) {
    console.log(err)
    return res
      .status(500)
      .json({ success: false, message: 'Server Error' + err })
  }
}

//@des GET single Performance for specific account
//@route GET api/Performance/:id
//@accesss private (allow for Admin)
exports.performanceDetails = async (req, res) => {
  try {
    const id = req.params.id
    const performance = await Performance.findOne({
      _id: id
    }).populate('student', 'name _id')

    if (!performance) {
      return res
        .status(404)
        .json({ success: false, message: 'Performance is not found' })
    }

    return res.status(200).json({
      success: true,
      data: Performance
    })
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: 'Server error: ' + err })
  }
}

//@des PUT Update single Performance for specific account
//@route PUT api/v2/Performance/:id
//@accesss private (allow for Admin)
exports.updatePerformance = async function (req, res) {
  try {
    const { dayId, taskId, quizId, connected, taskResult, student } = req.body

    const day = await Day.findById(dayId)

    const start = new Date().setHours(0, 0, 0, 0)

    const end = new Date().setHours(23, 59, 59, 999)

    const performance = await Performance.findOne({
      createdAt: { $gte: start, $lt: end },
      student: req.user._id,
      bootcamp: req.params.bootcampId
    })

    const course = await Bootcamp.findById(req.params.bootcampId)

    let update

    if (connected) {
      update = {
        online: new Date()
      }
    }

    if (dayId) {
      update = {
        watchingLectures: [...performance.watchingLectures, day._id],
        watchingLectureScore: 100
      }
    }

    if (taskId) {
      const task = await Task.findById(taskId)

      update = {
        submittedTask: taskId,
        submittedTaskScore: 100
      }
    }

    if (taskResult) {
      let resultScore

      if (taskResult === 'Failed') resultScore = 30

      if (taskResult === 'Not Bad') resultScore = 65

      if (taskResult === 'Good') resultScore = 85

      if (taskResult === 'Excellent') resultScore = 100

      await Performance.findOneAndUpdate(
        {
          createdAt: { $gte: start, $lt: end },
          student
        },
        {
          taskResultScore: resultScore
        }
      )
    }

    if (quizId) {
      const quiz = await Quiz.findById(quizId)

      const quizAnswer = await QuizAnswer.findOne({
        quiz: quizId,
        user: req.user._id
      })

      let score

      const answerSubmitted = new Date(quizAnswer.createdAt).getTime()

      const twoDaysQuizCreated = new Date(quiz.createdAt).setDate(
        new Date(quiz.createdAt).getDate() + 2
      )

      console.log(twoDaysQuizCreated)

      const threeDaysQuizCreated = new Date(quiz.createdAt).setDate(
        new Date(quiz.createdAt).getDate() + 3
      )

      const fourDaysQuizCreated = new Date(quiz.createdAt).setDate(
        new Date(quiz.createdAt).getDate() + 4
      )

      const fiveDaysQuizCreated = new Date(quiz.createdAt).setDate(
        new Date(quiz.createdAt).getDate() + 5
      )

      const sevenDaysQuizCreated = new Date(quiz.createdAt).setDate(
        new Date(quiz.createdAt).getDate() + 7
      )

      if (answerSubmitted <= twoDaysQuizCreated) {
        score = 100
      }

      if (
        answerSubmitted > twoDaysQuizCreated &&
        answerSubmitted <= threeDaysQuizCreated
      ) {
        score = 80
      }

      if (
        answerSubmitted > threeDaysQuizCreated &&
        answerSubmitted <= fourDaysQuizCreated
      ) {
        score = 70
      }

      if (
        answerSubmitted > fourDaysQuizCreated &&
        answerSubmitted <= fiveDaysQuizCreated
      ) {
        score = 60
      }

      if (
        answerSubmitted > fiveDaysQuizCreated &&
        answerSubmitted <= sevenDaysQuizCreated
      ) {
        score = 50
      }

      if (answerSubmitted > sevenDaysQuizCreated) {
        score = 0
      }

      let resultScore

      if (quizAnswer.status === 'Failed') resultScore = 30

      if (quizAnswer.status === 'Not Bad') resultScore = 65

      if (quizAnswer.status === 'Good') resultScore = 85

      if (quizAnswer.status === 'Excellent') resultScore = 100

      update = {
        submittedQuiz: quizId,
        submittedQuizScore: score,
        quizResultScore: resultScore
      }
    }
    const updatedPerformance = await Performance.findOneAndUpdate(
      {
        createdAt: { $gte: start, $lt: end },
        student: req.user._id,
        bootcamp: course._id
      },
      update,
      {
        new: true
      }
    )

    return res.status(200).json({
      success: true,
      data: updatedPerformance
    })
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: 'Server Error : ' + err })
  }
}

//@des DELETE single Performance for specific account
//@route DELETE api/v2/Performance/:id
//@accesss private (allow for Admin)
exports.deletePerformance = async function (req, res) {
  try {
    const { id } = req.params
    const Performance = await Performance.findById(id)

    if (!Performance)
      return res.status(404).json({
        message: "Performance doesn't  Exist In "
      })

    await Performance.deleteOne()

    return res.status(200).json({
      data: null,
      message: 'Performance hase been deleted',
      success: true
    })
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: 'Server Error : ' + err })
  }
}
