const { check } = require("express-validator");

const userValidatorChek = [
  check("name", "Name can not be empety").notEmpty().bail(),
  check("email", "Email must be given ").notEmpty().isEmail().bail(),
  check("password", "Password must be more than 8 chars").isLength({ min: 8 }),
];

const UpdateUserValidator = [
  check("name", "Name can not be empety").notEmpty().bail(),
  check("email", "Email must be given ").notEmpty().isEmail().bail(),
];


// validate update user for admin 
const UpdateAnyUserValidator = [
  check("role", "role can not be empety").notEmpty().bail(),
];


const AccessUserValidator =[
  check('ViewerUserId',"Viewer User Should Be Chosen").notEmpty().bail(),
]
module.exports = {
  userValidatorChek,
  UpdateUserValidator,
  UpdateAnyUserValidator,
  AccessUserValidator
};
