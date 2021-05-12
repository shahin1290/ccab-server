const express = require('express')
const router = express.Router()
const answerController = require('../controllers/answerController')
const { AllowIfLogin, grantAccess } = require('../middleware/auth')
const {
  AnswerValidate,
  uploadCallBack
} = require('../middleware/answersMiddleware')
// router.route("/").post(AllowIfLogin, answerController.addNewAnswer);

router
  .route('/myanswers')
  .get(
    AllowIfLogin,
    grantAccess('readOwn', 'Answer'),
    answerController.studentAnswers
  )

//download assignment file
router.route('/:id/download').get(AllowIfLogin, answerController.downloadFile)

router
  .route('/:bootcampId/:taskId')
  // view all answer for specific task
  .get(AllowIfLogin, grantAccess('readOwn', 'Answer'), answerController.view)
  // update specific answer as student
  .put(
    AllowIfLogin,
    grantAccess('updateOwn', 'Answer'),
    uploadCallBack,
    AnswerValidate,
    answerController.addNewAnswer
  )

router
  .route('/:bootcampId/:taskId/:id')
  .get(AllowIfLogin, grantAccess('readOwn', 'Answer'), answerController.viewOne)

  //update specific answer as Mentor *** check the bootcampId

  .put(
    AllowIfLogin,
    grantAccess('updateOwn', 'Answer'),
    answerController.updateAnswerStatus
  )

  // delete specific answer, *** check if Mentor is own the bootcamp for
  .delete(
    AllowIfLogin,
    grantAccess('deleteAny', 'Answer'),
    answerController.delete
  )

module.exports = router
