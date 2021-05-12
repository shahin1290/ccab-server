const jwt = require('jsonwebtoken')
const User = require('../models/userModel')
const { roles } = require('../roles/roles')
const Bootcamp = require('../models/bootcampModel')

// protect route ==> only the autorized user can be accessed

const AllowIfLogin = async (req, res, next) => {
  let token
  try {
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1]
      //console.log('token: ',token);
      if (!token) {
        return res.status(401).json({
          message: 'Unauthorized user, Please Login'
        })
      }

      const decoded = jwt.verify(token, process.env.JWT_KEY)
      
      req.user = await User.findById(decoded.id).select('-password')
      //console.log(req.user);
      if (!req.user)
        return res.status(403).json({
          success: false,
          message: 'Your Account has been deactivated.'
        })
      // if (req.user.token !== token){
      //     return res.status(403).json({message: "Your Account has been deactivated.",});}
      next()
    } else {
      return res.status(401).json({
        message: 'Unauthorized user, Please Login'
      })
    }
  } catch (error) {
    console.log(error)
    return res.status(401).json({
      message: 'You have to Login or Sign up'
    })
  }
}

// grantAccess function
const grantAccess = (action, resource) => {
  return async (req, res, next) => {
    try {

      const permission = roles.can(req.user.user_type)[action](resource)

      const id = req.params.id
      
      if (id){
        const bootcamp = await Bootcamp.findById(id)
      }
      


      console.log('PERMISSION IS ' + permission.granted)

      //if permission not granted
      if (!permission.granted) {
        return res.status(401).json({
          success: false,
          error: "You Don't Have Enough Permission To Preform This Action"
        })
      } else {
        // if update has rate, trigger pass noly rate value from DB to rate function
        next()
      }
    } catch (error) {
      next(error)
    }
  }
}

// admin route ==> only the autorized user (Admin) can be accessed
const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next()
  } else {
    res.status(401).json({
      message: 'Unauthorized user, User must be an Admin'
    })
  }
}

module.exports = { AllowIfLogin, admin, grantAccess }
