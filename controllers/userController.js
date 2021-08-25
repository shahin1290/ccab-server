const User = require('../models/userModel')
const bcrypt = require('bcryptjs')
const { validationResult } = require('express-validator')
const Task = require('../models/taskModel')
const jwt = require('jsonwebtoken')
const Answer = require('../models/answerModel')
const Bootcamp = require('../models/bootcampModel')
const Quiz = require('../models/quizModel')
const QuizAnswer = require('../models/quizAnswerModel')
const { sendMail } = require('../middleware/sendMail')
const { sendResetPasswordMail } = require('../middleware/sendResetPasswordMail')
const crypto = require('crypto')

//********** validation Resault ************

function getValidationResualt(req) {
  const error = validationResult(req)
  if (!error.isEmpty()) return error.array()
  return false
}

//********** is email OR name exist ************
async function isEmailOrNameExist(email, name, id) {
  const users = await User.find({
    $and: [{ $or: [{ email: email }, { name: name }] }, { _id: { $ne: id } }]
  })
  //console.log('inner func :',users);
  if (users.length) return users
  return false
}

//@ privat for (Admin all users , ViwerUser specified users, mentor bootcamps Users)
//@ DESC GET users
//@ ROUTE /api/users

exports.getUsers = async (req, res) => {
  try {
    // if current user is an admin
    if (req.user.user_type === 'AdminUser') {
      const users = await User.find().select('-__v')
      if (!users) {
        return res.status(404).json({
          success: false,
          message: 'No users found!'
        })
      }
      res.status(200).json({
        success: true,
        data: users
      })
    }
    /****************************************** */
    // if current user is an ViewerUser
    // get only the uers that's specified for him.
    if (req.user.user_type === 'ViewerUser') {
      let user = await User.findById(req.user._id)
      if (!user.AccessUsers.length)
        return res
          .status(404)
          .json({ success: false, message: 'No users found!' })
      let AllUsers = []
      let singleUser = {}

      for (let i in user.AccessUsers) {
        singleUser = await User.findById(user.AccessUsers[i])
        AllUsers.push(singleUser)
      }
      res.status(200).json({ success: true, data: AllUsers })
    }

    /****************************************** */

    // if current user is an MentorUser
    // get only his students bootcamps
    if (req.user.user_type === 'MentorUser') {
      // get all bootcamps for current mentor
      const mybootcamp = await Bootcamp.find({ mentor: req.user._id }).populate(
        'students'
      )
      // if there is no bootcamps found
      if (!mybootcamp.length)
        return res
          .status(404)
          .json({ success: false, message: 'No users found!' })
      const MentorUsers = []
      for (let bootcamp of mybootcamp) {
        // store each bootcamp in a new array
        MentorUsers.push({
          _id: bootcamp._id,
          name: bootcamp.name,
          students: bootcamp.students
        })
      }
      // return the array
      res.status(200).json({ success: true, data: MentorUsers })
    }
  } catch (error) {
    console.log(error.message)
    res.status(500).json({
      message: error
    })
  }
}

exports.getUsersNumbers = async (req, res) => {
  try {
    const users = await User.find().select('-__v')
    if (!users) {
      return res.status(404).json({
        success: false,
        message: 'No users found!'
      })
    }
    res.status(200).json({ success: true, data: users.length })
  } catch (error) {
    console.log(error.message)
    res.status(500).json({
      message: error
    })
  }
}

//@ DESC POST a user only for admin
//@ ROUTE /api/users
// Register a User
exports.new = async (req, res) => {
  // checking the user input!
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg })
  }

  try {
    const { name, email, password, user_type, phone, gender, language } =
      req.body

    // check if the name or email exist
    const EmailORNameExist = await isEmailOrNameExist(email, name, null)
    //console.log('EmailORNameExist : ',EmailORNameExist.length);

    //if true : return error
    if (EmailORNameExist.length)
      return res
        .status(400)
        .json({ success: false, message: 'Name OR Email is Taken!' })

    // how to verify that email was taken or not
    let user = await User.findOne({ email })
    if (user) {
      return res.status(404).json({
        success: false,
        message: 'Email is not valid or email is already taken!'
      })
    }

    user = new User({
      name,
      email,
      user_type,
      phoneNumber: phone,
      gender: gender,
      language: language
    })

    // salt the password

    const salt = await bcrypt.genSalt(10)
    user.password = await bcrypt.hash(password, salt)
    await user.save()

    const newUser = await User.findOne({ email })

    // ** check if the new user inrolled with a bootcamp then check the assignemnt and create new answers if exist !

    /* Code here */

    // ** create new answers for the new user of all available task
    // const tasks = await Task.find();
    // if (tasks.length) {
    //   for (task of tasks) {
    //     answer = new Answer({
    //       user: newUser._id,
    //       task: task._id,
    //     });
    //     await answer.save();
    //   }
    // }

    //send mail .............>
    const toUser = { email: email, name: name }
    const subjet = 'Welcome to Codify Student Dashboard'
    const html = {
      student: '',
      text: " Codify's Student Dashboard. There you can access all your assignments and submit them online.Your login credentials are ",
      assignment:
        '<br><br><i>Email: ' +
        email +
        '</i><br><i>Password: ' +
        password +
        '</i><br><br>You can Change Your Password once you are logged in to your dashboard!',
      link: 'https://ccab.tech/login'
    }
    const mailStatus = sendMail(res, toUser, subjet, html)

    const htmlToAdmin = {
      student: '',
      text:
        'A New Students has been rigstered !<b>' +
        req.user.name +
        '            <table> \
      <tr> <th> Full Name </th> <th>Email</th> <th>Phone Number</th><th>gender</th></tr>\
      <tr>  <td>' +
        name +
        '</td><td>' +
        email +
        '</td><td>' +
        phone +
        '</td><td>' +
        gender +
        '</td></tr> \
      </table>',
      assignment: '',
      link: 'https://ccab.tech/admin-users-list'
    }
    const AdminmailStatus = sendMail(
      res,
      { email: 'info@codifycollege.se', name: 'Admin' },
      'A New Students' + req.user.name,
      htmlToAdmin
    )

    //console.log('mailStatus: '+( mailStatus));

    if (mailStatus)
      res.status(201).json({
        success: true,
        data: user
      })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: 'Server Error' + error
    })
  }
}

//@ DESC GET OWN Profile
//@ ROUTE /api/users/profile
exports.view = async (req, res) => {
  try {
    var user = await User.findById(req.user._id).populate(
      'teachingFields',
      'name _id'
    )

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No user found!'
      })
    }
    return res.status(200).json({
      success: true,
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phoneNumber,
      user_type: user.user_type,
      avatar: user.avatar,
      bio: user.bio,
      skills: user.skills,
      networkAddresses: user.networkAddresses,
      teachingFields: user.teachingFields
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: error
    })
  }
}

//@ DESC GET a user
//@ ROUTE /api/users/:id
exports.viewUserProfile = async (req, res) => {
  try {
    const id = req.params.id

    var user = await User.findById(id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No user found!'
      })
    }

    return res.status(200).json({
      success: true,
      _id: user._id,
      name: user.name,
      email: user.email,
      user_type: user.user_type,
      phone: user.phoneNumber,
      avatar: user.avatar,
      bio: user.bio
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: error
    })
  }
}

//@ DESC UPDATE A user ( own profile)
//@ ROUTE /api/users/profile

exports.update = async (req, res) => {
  console.log(req.body)
  const errors = getValidationResualt(req)
  if (errors)
    //returning only first error allways
    return res.status(400).json({ success: false, message: errors[0].msg })

  try {
    const {
      name,
      email,
      phoneNumber,
      bio,
      skills,
      networkAddresses,
      teachingFields,
      status
    } = req.body

    //check if the name or the email is taken ...>
    const EmailORNameExist = await isEmailOrNameExist(email, name, req.user._id)

    //console.log('EmailORNameExist : ',EmailORNameExist.length);

    //if true : return error
    if (EmailORNameExist.length)
      return res
        .status(400)
        .json({ success: false, message: 'Name OR Email is Taken!' })

    const user = await User.findById(req.user._id) //logged in user!!
    if (!user) {
      return res.status(404).json({ success: false, message: 'No user found!' })
    }

    // if passwrod passed through body !!
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10)
      const password = await bcrypt.hash(req.body.password, salt)
      await User.updateOne(
        { _id: user._id },
        {
          name: name,
          email: email,
          password: password,
          bio,
          skills: JSON.parse(skills),
          networkAddresses: JSON.parse(networkAddresses),
          teachingFields: JSON.parse(teachingFields)
        }
      )
    } else if (req.file) {
      await User.updateOne(
        { _id: user._id },
        {
          name,
          email,
          phoneNumber,
          avatar: req.file.filename,
          bio,
          skills: skills && JSON.parse(skills),
          networkAddresses: networkAddresses && JSON.parse(networkAddresses),
          teachingFields: teachingFields && JSON.parse(teachingFields),
          status
        }
      )
    } else {
      await User.updateOne(
        { _id: user._id },
        {
          name,
          email,
          phoneNumber,
          bio,
          skills: skills && JSON.parse(skills),
          networkAddresses: networkAddresses && JSON.parse(networkAddresses),
          teachingFields: teachingFields && JSON.parse(teachingFields),
          status
        }
      )
    }

    // const generateToken = (id) => {
    //   return jwt.sign({ id }, process.env.JWT_KEY, { expiresIn: 3600 });
    //   /**
    //    * In order to see the other properties on decoding the TOKEN, just add more properties into jwt.sign({id, email, name...etc.})
    //    * In this case, we are only using id!
    //    */
    // };
    const updatedUser = await User.findById(user._id)
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      user_type: updatedUser.user_type,
      token: updatedUser.token,
      avatar: updatedUser.avatar,
      bio: updatedUser.bio,
      skills: updatedUser.skills,
      networkAddresses: updatedUser.networkAddresses
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: error
    })
  }
}

//@ DESC DELETE A user
//@ ROUTE /api/users:/id
exports.delete = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No user found!'
      })
    }
    await Answer.deleteMany({ user: user._id })
    const token = jwt.sign({ _id: user._id }, process.env.JWT_KEY)

    await User.updateOne({ _id: user._id }, { token: token })
    await User.deleteOne({ _id: user._id })

    res.status(200).json({
      success: true,
      message: user.name + ' is deleted'
    })
  } catch (error) {
    console.log(error.message)
    res.status(500).json({
      message: error
    })
  }
}

/************
 * User register and User login
 * /api/users/register
 * /api/users/login
 */

/***
 *  USER REGISTER
 */

/***
 *  USER LOGIN
 */

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })

    if (user && (await user.verifyPassword(password))) {
      const generateToken = (id) => {
        return jwt.sign({ id }, process.env.JWT_KEY)
      }

      user.token = generateToken(user._id)
      await user.save()

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        user_type: user.user_type,
        phone: user.phoneNumber,
        token: user.token,
        language: user.language,
        avatar: user.avatar
      })
    } else {
      res.status(401).json({
        message: 'Invalid credential'
      })
    }
  } catch (error) {
    console.log(error.message)
    res.status(500).json({
      message: error
    })
  }
}

//********** valid token  **********
//@des Check token validation
//@route Get api/v1/valid
//@accesss Public
exports.isTokenValid = async (req, res, next) => {
  try {
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1]

      if (token == 'undefined')
        return res
          .status(401)
          .json({ message: 'Unauthorized user, Please Login' })

      const decoded = jwt.verify(token, process.env.JWT_KEY)
      if (!decoded)
        return res
          .status(401)
          .json({ message: 'Unauthorized user, Please Login' })
      req.user = await User.findById(decoded.id).select('-password')
      if (!req.user)
        return res
          .status(404)
          .json({ message: 'Unauthorized user, Please Login' })

      return res.status(200).json({
        success: true,
        user: {
          token: token,
          _id: req.user._id,
          name: req.user.name,
          email: req.user.email,
          phone: phoneNumber,
          language: user.language,
          user_type: req.user.user_type,
          avatar: req.user.avatar
        }
      })
    }

    return res.status(401).json(false)
  } catch (err) {
    console.log('Server Error : ' + err)
    return res
      .status(500)
      .json({ success: false, message: 'Server Error : ' + err })
  }
}

//@des register new user
//@route POST api/users/register
//@accesss Public
exports.register = async (req, res) => {
  // checking the user input!
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg })
  }

  try {
    const { name, email, password, phoneNumber, gender, language } = req.body

    // check if the name or email exist
    const EmailORNameExist = await isEmailOrNameExist(email)
    //console.log('EmailORNameExist : ',EmailORNameExist.length);

    //if true : return error
    if (EmailORNameExist.length)
      return res
        .status(400)
        .json({ success: false, message: 'Email is already in use!' })

    // how to verify that email was taken or not
    let user = await User.findOne({ email })
    if (user) {
      return res.status(404).json({
        success: false,
        message: 'Email is not valid or email is already taken!'
      })
    }

    user = new User({
      name,
      email,
      phoneNumber,
      user_type: 'StudentUser',
      gender,
      language
    })

    // salt the password

    const salt = await bcrypt.genSalt(10)
    user.password = await bcrypt.hash(password, salt)
    await user.save()

    const newUser = await User.findOne({ email }).select('-password')

    //update free bootcamp students array
    const freeBootcamps = await Bootcamp.find({ price: 0 })

    if (freeBootcamps.length > 0) {
      for (bootcamp of freeBootcamps) {
        await Bootcamp.findByIdAndUpdate(bootcamp._id, {
          $push: { students: newUser._id }
        })
      }

      const Quizzess = await Quiz.find({ bootcamp })

      if (Quizzess.length > 0) {
        Quizzess.forEach(async (quiz) => {
          //craete the answers
          const quizAnswer = new QuizAnswer({
            user: newUser,
            quiz: quiz._id
          })

          await quizAnswer.save()
        })
      }

      const tasks = await Task.find({ bootcamp })

      if (tasks.length > 0) {
        tasks.forEach(async (task) => {
          //craete the answers
          const answer = new Answer({
            user: newUser,
            task: task._id
          })

          await answer.save()
        })
      }
    }

    //send mail .............>
    const toUser = { email: email, name: name }
    const subjet = 'Welcome to Codify Student Dashboard'
    const html = {
      student: '',
      text: "Congratulations on taking a first strong step towards becoming a Full Stack Web Developer. <br> In 16-30 weeks, we'll teach you the essentials to start working as a Full Stack dev",
      assignment: '',
      link: ''
    }
    const mailStatus = sendMail(res, toUser, subjet, html)

    const htmlToAdmin = {
      student: '',
      text: '   A New Students Registered !   ',
      assignment:
        '<table> \
          <tr> <th> Full Name </th> <th>Email</th> <th>Phone Number</th><th>gender</th></tr>\
          <tr>  <td>' +
        name +
        '</td><td>' +
        email +
        '</td><td>' +
        phoneNumber +
        '</td><td>' +
        gender +
        '</td></tr> \
          </table>',
      link: 'https://ccab.tech/admin-users-list'
    }
    const AdminmailStatus = sendMail(
      res,
      { email: 'info@codifycollege.se', name: 'Admin' },
      'A New Students Registered :' + name,
      htmlToAdmin
    )

    //console.log('mailStatus: '+( mailStatus));

    if (mailStatus && AdminmailStatus)
      res.status(201).json({
        success: true,
        data: newUser
      })
  } catch (err) {
    console.log('Server Error : ' + err)
    return res
      .status(500)
      .json({ success: false, message: 'Server Error : ' + err })
  }
}

//@des update user info
//@route PUT /api/users/:id
//@accesss Private for Admin
exports.updateUser = async (req, res, next) => {
  // checking the user input!
  const errors = getValidationResualt(req)
  //console.log(errors.length);
  if (errors.length)
    //returning only first error allways
    return res.status(400).json({ success: false, message: errors[0].msg })
  try {
    const id = req.params.id
    const { role } = req.body

    const user = await User.findById(id) //find the user!!

    if (!user) {
      return res.status(404).json({ success: false, message: 'No user found!' })
    }

    // if passwrod passed through body !!
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10)
      const password = await bcrypt.hash(req.body.password, salt)
      await User.updateOne({ _id: user._id }, { user_type: role })
    } else {
      // if there is no password !
      await User.updateOne({ _id: user._id }, { user_type: role })
    }

    const updatedUser = await User.findById(user._id)
    //console.log(`updatedUser: ` ,updatedUser);

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      user_type: updatedUser.user_type,
      token: updatedUser.token
    })
  } catch (err) {
    console.log('Server Error : ' + err)
    return res
      .status(500)
      .json({ success: false, message: 'Server Error : ' + err })
  }
}

//@des to give accesss for viewerUser to access specific users
//@route POST /api/users/access
//@accesss Private for Admin
exports.giveAccess = async (req, res, next) => {
  // checking the user input!
  const errors = getValidationResualt(req)
  //console.log(errors.length);
  if (errors.length)
    //returning only first error allways
    return res.status(400).json({ success: false, message: errors[0].msg })
  try {
    const { ViewerUserId, usersId } = req.body

    const user = await User.findById(ViewerUserId) //find the ViwerUser!!
    // check if viewerUser exist
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'Viewer User No found!' })
    }
    //check if usersids array is not empty
    if (!usersId.length) {
      return res
        .status(400)
        .json({ success: false, message: 'You need to add user to access' })
    }

    user.AccessUsers = usersId
    await user.save()

    const updatedUser = await User.findById(user._id)
    //console.log(`updatedUser: ` ,updatedUser);
    res.json({
      _id: updatedUser._id,
      AccessUsers: updatedUser.AccessUsers,
      name: updatedUser.name,
      email: updatedUser.email,
      user_type: updatedUser.user_type,
      token: updatedUser.token
    })
  } catch (err) {
    console.log('Server Error : ' + err)
    return res
      .status(500)
      .json({ success: false, message: 'Server Error : ' + err })
  }
}

//@des to give accesss for user to update password
exports.forgotPassword = async (req, res, next) => {
  // 1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email })
  if (!user) {
    return res.status(404).json({ success: false, message: 'No User  found!' })
  }

  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken()
  await user.save({ validateBeforeSave: false })

  // 3) Send it to user's email
  try {
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/users/reset-password/${resetToken}`

    //send mail .............>
    const toUser = { email: req.body.email, name: user.name }

    const link = `http://localhost:3000/reset-password/${resetToken}`

    sendResetPasswordMail(res, toUser, link)

    res.status(200).json({
      status: 'success',
      message: 'Reset instructions sent to email!'
    })
  } catch (err) {
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined
    await user.save({ validateBeforeSave: false })

    return res
      .status(500)
      .json({ success: false, message: 'Server Error : ' + err })
  }
}

exports.resetPassword = async (req, res) => {
  try {
    // 1) Get user based on the token
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex')

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    })

    // 2) If token has not expired, and there is user, set the new password
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: 'Token is invalid or has expired' })
    }
    // 3) Update changedPasswordAt property for the user

    // salt the password
    const salt = await bcrypt.genSalt(10)
    user.password = await bcrypt.hash(req.body.password, salt)
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined
    await user.save()

    // 4) Log the user in
    const generateToken = (id) => {
      return jwt.sign({ id }, process.env.JWT_KEY)
    }

    user.token = generateToken(user._id)
    await user.save()

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      user_type: user.user_type,
      phone: user.phoneNumber,
      token: user.token,
      language: user.language,
      avatar: user.avatar
    })
  } catch (err) {
    console.log('Server Error : ' + err)
    return res
      .status(500)
      .json({ success: false, message: 'Server Error : ' + err })
  }
}
