const express = require('express')
const router = express.Router()
const quizController = require('../controllers/quizController')
const { quizValidCheck } = require('../middleware/quizValid')
const { AllowIfLogin, grantAccess } = require('../middleware/auth')

//myQuizList
router
  .route('/myquizlist')
  .get(
    AllowIfLogin,
    grantAccess('readOwn', 'task'),
    quizController.studentQuizzes
  )

router
  .route('/:bootcampId')
  // get all task for student
  .get(
    AllowIfLogin,
    grantAccess('readOwn', 'task'),
    quizController.getAllQuizzes
  )
router
  .route('/:bootcampId/:weekId')
  .post(
    AllowIfLogin,
    grantAccess('createOwn', 'task'),
    quizValidCheck,
    quizController.newQuiz
  )

router
  .route('/:bootcampId/:weekId/:id')
  .get(AllowIfLogin, grantAccess('readOwn', 'task'), quizController.quizDetails)

  .put(
    AllowIfLogin,
    grantAccess('updateOwn', 'task'),
    quizController.updateQuiz
  )
  .delete(
    AllowIfLogin,
    grantAccess('deleteOwn', 'task'),
    quizController.deleteQuiz
  )

module.exports = router
