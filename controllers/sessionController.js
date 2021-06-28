const { validationResult } = require('express-validator')
const Session = require('../models/sessionModel')

//********** default route ************
//@des Get all Session for specific account
//@route Get api/v2/Session
//@accesss private (allow for all users)

exports.getAllSessions = async (req, res, next) => {
  try {
    const sessions = await Session.find({ instructor: req.user._id })

    console.log();

    if (!sessions.length)
      return res
        .status(404)
        .json({ success: false, message: 'There is No Data Found' })

    return res.status(200).json({
      success: true,
      data: sessions
    })
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: 'Server Error' + err })
  }
}

//@des Get all Session as admin
//@route Get api/v2/Session/mange
//@accesss private (allow for all users)
exports.manageSession = async (req, res, next) => {
  try {
    const session = await Session.find()

    if (!session.length)
      return res
        .status(404)
        .json({ success: false, message: 'There is No Data Found' })

    return res.status(200).json({
      success: true,
      count: session.length
    })
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: 'Server Error' + err })
  }
}

//@des POST new Session for specific account
//@route POST api/v2/Session
//@accesss private (allow for all users)
exports.newSession = async (req, res, next) => {
  try {
    const newSession = new Session({ instructor: req.user._id })
    const session = await newSession.save()

    return res.status(201).json({
      success: true,
      data: session
    })
  } catch (err) {
    console.log(err)
    return res
      .status(500)
      .json({ success: false, message: 'Server Error' + err })
  }
}

//@des GET single Session for specific account
//@route GET api/Session/:id
//@accesss private (allow for Admin)
exports.sessionDetails = async (req, res) => {
  try {
    const id = req.params.id
    const session = await Session.findOne({
      _id: id
    })

    if (!session) {
      return res
        .status(404)
        .json({ success: false, message: 'Session is not found' })
    }

    return res.status(200).json({
      success: true,
      data: session
    })
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: 'Server error: ' + err })
  }
}

//@des PUT Update single Session for specific account
//@route PUT api/v2/Session/:id
//@accesss private (allow for Admin)
exports.updateSession = async function (req, res) {
  try {
    const errors = getValidationResualt(req)
    if (errors.length)
      //returning only first error allways
      return res.status(400).json({ success: false, message: errors[0].msg })

    const id = req.params.id

    const update = req.body

    const updatedSession = await Session.findOneAndUpdate({ _id: id }, update, {
      new: true
    })

    return res.status(200).json({
      success: true,
      data: updatedSession
    })
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: 'Server Error : ' + err })
  }
}

//@des DELETE single Session for specific account
//@route DELETE api/v2/Session/:id
//@accesss private (allow for Admin)
exports.deleteSession = async function (req, res) {
  try {
    const { id } = req.params
    const session = await Session.findById(id)

    if (!session)
      return res.status(404).json({
        message: "Session doesn't  Exist In "
      })

    await session.deleteOne()

    return res.status(200).json({
      data: null,
      message: 'Session hase been deleted',
      success: true
    })
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: 'Server Error : ' + err })
  }
}
