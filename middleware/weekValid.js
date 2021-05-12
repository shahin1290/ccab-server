const { check } = require('express-validator')

const weekValidCheck = [
  check('name', 'Name can not be empty').notEmpty().bail()
]

module.exports = {
  weekValidCheck
}
