const Session = require('../models/sessionModel')
const Appointment = require('../models/appointmentModel')
const User = require('../models/userModel')
const { sendMail } = require('../middleware/sendMail')

//********** default route ************
//@des Get all Session for specific account
//@route Get api/v2/Session
//@accesss private (allow for all users)

exports.getAllSessions = async (req, res, next) => {
  try {
    let sessions

    if (req.user.user_type === 'AdminUser') {
      sessions = await Session.find()
        .populate('student', 'name _id')
        .populate('service', 'name _id')
    }

    if (req.user.user_type === 'InstructorUser') {
      sessions = await Session.find({ instructor: req.user._id })
        .populate('student', 'name _id')
        .populate('service', 'name _id')
    }

    if (req.user.user_type === 'StudentUser') {
      sessions = await Session.find({ student: req.user._id })
        .populate('student', 'name _id')
        .populate('service', 'name _id')
    }

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
  const { startDate, endDate, notes, selectedAppointment } = req.body

  const appointment = await Appointment.findOne({
    _id: selectedAppointment
  })
  try {
    const newSession = new Session({
      instructor: appointment.instructor,
      startDate,
      endDate,
      notes,
      student: appointment.student,
      service: appointment.service
    })
    const session = await newSession.save()

    if (session) {
      await Appointment.findOneAndUpdate(
        { _id: appointment._id },
        {
          sessionNumber:
            appointment.sessionNumber > 0 && appointment.sessionNumber - 1
        }
      )
    }

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
    }).populate('student', 'name _id')

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
    const id = req.params.id

    const update = req.body

    console.log('update', update);

    const updatedSession = await Session.findOneAndUpdate({ _id: id }, update, {
      new: true
    })

    if (req.body.status) {
      console.log(req.body.feedback)
      //send email to admin
      const admin = await User.findOne({ user_type: 'AdminUser' })

      const toUser = { email: admin.email, name: admin.name }
      const subject = 'Report Card'
      const html = {
        student: '',
        text: 'We want to inform you that a feedback is submitted.',
        assignment:
          '<table> \
          <tr> <th> Preparation </th> <th>message</th></tr>\
          <tr>  <td>' +
          req.body.feedback.prepared +
          '</td><td>' +
          req.body.feedback.message +
          '</td></tr> \
          </table>',
        link: 'https://ccab.tech/profile'
      }

      sendMail(res, toUser, subject, html)
    }

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
