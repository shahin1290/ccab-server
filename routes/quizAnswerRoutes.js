const express = require('express')
const router = express.Router()
const quizAnswerController = require('../controllers/quizAnswerController')
const { quizAnswerValidCheck } = require('../middleware/quizAnswerValid')
const { AllowIfLogin, grantAccess } = require('../middleware/auth')


router
  .route(AllowIfLogin,grantAccess('readOwn', 'Answer'),'/myquizzes')
    .get(quizAnswerController.getMyQizzeAnswer)

router
  .route('/myQuizAnswers')
  .get(
    AllowIfLogin,
    grantAccess('readOwn', 'Answer'),
    quizAnswerController.studentQuizAnswers
  )

router
  .route('/:bootcampId/:quizId')
  .get(
    AllowIfLogin,
    grantAccess('readOwn', 'Answer'),
    quizAnswerController.getAllQuizAnswers
  )
  .put(
    AllowIfLogin,
    grantAccess('updateOwn', 'Answer'),
    quizAnswerController.updateQuizAnswer
  )

router
  .route('/:bootcampId/:quizId/:id')
  .get(
    AllowIfLogin,
    grantAccess('readOwn', 'Answer'),
    quizAnswerController.quizAnswerDetails
  )

  .delete(
    AllowIfLogin,
    grantAccess('deleteAny', 'Answer'),
    quizAnswerController.deleteQuizAnswer
  )

module.exports = router
