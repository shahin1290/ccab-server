const { check } = require('express-validator')

const quizValidCheck = [
  check('name', 'Name can not be empty').notEmpty().bail(),
  check('description', 'Description can not be empty').notEmpty().bail(),
  check('time', 'Time can not be empty').notEmpty().bail()
]

module.exports = {
  quizValidCheck
}
