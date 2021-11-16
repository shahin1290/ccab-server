const { validationResult } = require("express-validator");
const ServiceAppointment = require("../models/serviceAppointmentModel");

//@ DESC GET weeks
//@ ROUTE /api/weeks/:bootcampId
//@ access Protected/Admin, Mentor and Student
exports.getServiceAppointments = async (req, res) => {
  try {
    const serviceAppointments = await ServiceAppointment.find();

    if (serviceAppointments.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No ServiceAppointment  found!",
      });
    }

    if (serviceAppointments.length)
      return res.status(201).json({ success: true, data: serviceAppointments });
  } catch (error) {
    res.status(500).json({
      message: "Server Error" + error,
    });
  }
};

//@ DESC POST A NEW week
//@ ROUTE /api/weeks/:bootcampId
//@ access Protected/Admin, Mentor
exports.new = async (req, res) => {
  const { city, name, email, phone, helpingSubject, message, subjects } =
    req.body;
  try {
    const newServiceAppointment = new ServiceAppointment({
      city,
      name,
      email,
      phone,
      helpingSubject,
      message,
      subjects,
    });

    const serviceAppointment = await newServiceAppointment.save();

    if (serviceAppointment)
      return res.status(201).json({ success: true, data: serviceAppointment });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server Error" + error,
    });
  }
};
