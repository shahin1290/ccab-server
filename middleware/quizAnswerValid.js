const { check } = require('express-validator')

const quizAnswerValidCheck = [
  check('status', 'Status can not be empty').notEmpty().bail()
]

module.exports = {
  quizAnswerValidCheck
}
