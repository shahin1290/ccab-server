const express = require('express')
const router = express.Router()
const taskController = require('../controllers/taskController')
const { AllowIfLogin, grantAccess } = require('../middleware/auth')
const { taskValidCheck, uploadCallBack } = require('../middleware/taskValid')

/**
 * These routes are AllowIfLogin and requires user is being login or admin
 *
 */

//myTaskList
router.route('/mytasklist').get(AllowIfLogin, taskController.studentTasks)

router
  .route('/:bootcampId')
  .get(AllowIfLogin, grantAccess('readOwn', 'task'), taskController.getTasks)

router
  .route('/:bootcampId/:weekId')
  .post(
    AllowIfLogin,
    grantAccess('createOwn', 'task'),
    uploadCallBack,
    taskValidCheck,
    taskController.new
  )

// tasker
router
  .route('/taskupload')
  .get(AllowIfLogin, grantAccess('readOwn', 'task'), taskController.userTask)

//download assignment file
router.route('/:id/download').get(AllowIfLogin, taskController.downloadFile)

// Task Details
router
  .route('/:bootcampId/:id')
  .get(AllowIfLogin, grantAccess('readOwn', 'task'), taskController.view)
  .delete(AllowIfLogin, grantAccess('deleteOwn', 'task'), taskController.delete)

module.exports = router
