const Appointment = require('../models/appointmentModel')
const User = require('../models/userModel')

//********** default route ************
//@des Get all Appointment for specific account
//@route Get api/v2/Appointment
//@accesss private (allow for all users)

exports.getAllAppointments = async (req, res, next) => {
  try {
    const appointments = await Appointment.find({ instructor: req.user._id })
      .populate('student', 'name email _id')
      .populate('service', 'name _id')

    if (!appointments.length)
      return res
        .status(404)
        .json({ success: false, message: 'There is No Data Found' })

    return res.status(200).json({
      success: true,
      data: appointments
    })
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: 'Server Error' + err })
  }
}

//@des Get all Appointment as admin
//@route Get api/v2/Appointment/mange
//@accesss private (allow for all users)
exports.manageAppointment = async (req, res, next) => {
  try {
    const Appointment = await Appointment.find()

    if (!Appointment.length)
      return res
        .status(404)
        .json({ success: false, message: 'There is No Data Found' })

    return res.status(200).json({
      success: true,
      count: Appointment.length
    })
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: 'Server Error' + err })
  }
}

//@des POST new Appointment for specific account
//@route POST api/v2/Appointment
//@accesss private (allow for all users)
exports.newAppointment = async (req, res, next) => {
  const { instructor, service, sessionNumber } = req.body

  const student = await User.findById(req.user._id)
  try {
    const newAppointment = new Appointment({
      instructor,
      service,
      student,
      sessionNumber
    })
    const appointment = await newAppointment.save()

    return res.status(201).json({
      success: true,
      data: appointment
    })
  } catch (err) {
    console.log(err)
    return res
      .status(500)
      .json({ success: false, message: 'Server Error' + err })
  }
}

//@des GET single Appointment for specific account
//@route GET api/Appointment/:id
//@accesss private (allow for Admin)
exports.view = async (req, res) => {
  try {
    const id = req.params.id
    const Appointment = await Appointment.findOne({
      _id: id
    })

    if (!Appointment) {
      return res
        .status(404)
        .json({ success: false, message: 'Appointment is not found' })
    }

    return res.status(200).json({
      success: true,
      data: Appointment
    })
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: 'Server error: ' + err })
  }
}

//@des PUT Update single Appointment for specific account
//@route PUT api/v2/Appointment/:id
//@accesss private (allow for Admin)
exports.update = async function (req, res) {
  try {
    const errors = getValidationResualt(req)
    if (errors.length)
      //returning only first error allways
      return res.status(400).json({ success: false, message: errors[0].msg })

    const id = req.params.id

    const update = req.body

    const updatedAppointment = await Appointment.findOneAndUpdate(
      { _id: id },
      update,
      {
        new: true
      }
    )

    return res.status(200).json({
      success: true,
      data: updatedAppointment
    })
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: 'Server Error : ' + err })
  }
}

//@des DELETE single Appointment for specific account
//@route DELETE api/v2/Appointment/:id
//@accesss private (allow for Admin)
exports.delete = async function (req, res) {
  try {
    const { id } = req.params
    const Appointment = await Appointment.findById(id)

    if (!Appointment)
      return res.status(404).json({
        message: "Appointment doesn't  Exist In "
      })

    await Appointment.deleteOne()

    return res.status(200).json({
      data: null,
      message: 'Appointment hase been deleted',
      success: true
    })
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: 'Server Error : ' + err })
  }
}
