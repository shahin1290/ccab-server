const { validationResult } = require('express-validator')
const Service = require('../models/serviceModel')
const Week = require('../models/weekModel')
const Day = require('../models/dayModel')
const fs = require('fs')

//********** Functions ************************************

//********** validation Resault ************

function getValidationResualt(req) {
  const error = validationResult(req)
  if (!error.isEmpty()) return error.array()
  return false
}

//********** is Name exist ************
const isNameExist = async (serviceName) => {
  const service = await Service.find({ name: serviceName })
  if (service.length) {
    return true
  }
  return false
}

//********** Functions End************************************

//********** default route ************
//@des Get all services for specific account
//@route Get api/v2/services
//@accesss private (allow for all users)

exports.getAllServices = async (req, res, next) => {
  try {
    const pageSize = 6
    const page = Number(req.query.pageNumber) || 1
    const count = await Service.countDocuments()
    var services
    //console.log(req.user);

    console.log('normal user  request')
    if (req.query.pageNumber) {
      services = await Service.find({ published: true })
        .limit(pageSize)
        .skip(pageSize * (page - 1))
        .populate('instructors')
        .populate('students')
    } else {
      services = await Service.find({ published: true })
        .populate('instructors')
        .populate('students')
    }

    if (!services.length)
      return res
        .status(404)
        .json({ success: false, message: 'There is No Data Found' })

    return res.status(200).json({
      success: true,
      count: services.length,
      data: { services, page, pages: Math.ceil(count / pageSize) }
    })
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: 'Server Error' + err })
  }
}

//@des Get all services as admin
//@route Get api/v2/services/mange
//@accesss private (allow for all users)
exports.manageService = async (req, res, next) => {
  try {
    const pageSize = 10
    const page = Number(req.query.pageNumber) || 1
    const count = await Service.countDocuments()
    var services
    //console.log(req.user);

    console.log('Admin user  request')
    services = await Service.find()
      .limit(pageSize)
      .skip(pageSize * (page - 1))

    if (!services.length)
      return res
        .status(404)
        .json({ success: false, message: 'There is No Data Found' })

    return res.status(200).json({
      success: true,
      count: services.length,
      data: { services, page, pages: Math.ceil(count / pageSize) }
    })
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: 'Server Error' + err })
  }
}

//@des POST new service for specific account
//@route POST api/v2/services
//@accesss private (allow for all users)
exports.newService = async (req, res, next) => {
  try {
    const errors = getValidationResualt(req)
    if (errors.length)
      //returning only first error allways
      return res.status(400).json({ success: false, message: errors[0].msg })

    const services = await Service.find()

    // default new service
    const service = new Service()
    service.name = `service ${services.length + 1}`
    service.category = 'Web Development'
    service.description =
      'The essence of this board is to provide a high-level overview of your service. This is the place to plan and track your progress. '
    service.price = 1000
    service.seats = 10
    service.img_path = '/uplods/img.png'
    //service.created_at =
    const savedService = await service.save()

    return res.status(201).json({
      success: true,
      data: updatedService
    })
  } catch (err) {
    console.log(err)
    return res
      .status(500)
      .json({ success: false, message: 'Server Error' + err })
  }
}

//@des GET single service for specific account
//@route GET api/service/:id
//@accesss private (allow for Admin)
exports.serviceDetails = async (req, res) => {
  try {
    const id = req.params.id
    const service = await Service.findOne({
      _id: id
    })
      .populate('instructors', 'name _id avatar bio skills networkAddresses')
      .populate('students')

    if (!service) {
      return res
        .status(404)
        .json({ success: false, message: 'service is not found' })
    }

    return res.status(200).json({
      success: true,
      data: service
    })
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: 'Server error: ' + err })
  }
}

//@des PUT Update single service for specific account
//@route PUT api/v2/service/:id
//@accesss private (allow for Admin)
exports.updateService = async function (req, res) {
  try {
    const errors = getValidationResualt(req)
    if (errors.length)
      //returning only first error allways
      return res.status(400).json({ success: false, message: errors[0].msg })

    const id = req.params.id
    const service = await Service.findById(id)

    let update = req.body

    if (req.body.students) {
      update = { ...update, students: JSON.parse(req.body.students) }
    }

    if (req.body.students) {
      update = { ...update, instructors: JSON.parse(req.body.instructors) }
    }

    if (req.body.info_list) {
      update = { ...update, info_list: req.body.info_list }
    }

    if (req.file) {
      update = { ...update, img_path: req.file.filename }
    }

    const updatedservice = await Service.findOneAndUpdate({ _id: id }, update, {
      new: true
    })

    return res.status(200).json({
      success: true,
      data: updatedservice
    })
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: 'Server Error : ' + err })
  }
}

//@des DELETE single service for specific account
//@route DELETE api/v2/service/:id
//@accesss private (allow for Admin)
exports.deleteService = async function (req, res) {
  try {
    const { id } = req.params
    const service = await Service.findById(id)

    if (!service)
      return res.status(404).json({
        message: "service doesn't  Exist In "
      })

    await service.deleteOne()

    return res.status(200).json({
      data: null,
      message: 'service hase been deleted',
      success: true
    })
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: 'Server Error : ' + err })
  }
}
