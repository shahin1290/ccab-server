const { validationResult } = require('express-validator')
const ServiceCategory = require('../models/serviceCategoryModel')
const User = require('../models/userModel')

//@ DESC GET weeks
//@ ROUTE /api/weeks/:bootcampId
//@ access Protected/Admin, Mentor and Student
exports.getServiceCategories = async (req, res) => {
  try {
    const serviceCategories = await ServiceCategory.find()

    if (serviceCategories.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No Category found!'
      })
    }
    if (serviceCategories.length)
      return res.status(201).json({ success: true, data: serviceCategories })
  } catch (error) {
    res.status(500).json({
      message: 'Server Error' + error
    })
  }
}

//@ DESC POST A NEW week
//@ ROUTE /api/weeks/:bootcampId
//@ access Protected/Admin, Mentor
exports.new = async (req, res) => {
  const { name } = req.body

  try {
    const newServiceCategory = new ServiceCategory({
      name
    })

    const serviceCategory = await newServiceCategory.save()

    if (serviceCategory)
      return res.status(201).json({ success: true, data: serviceCategory })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: 'Server Error' + error
    })
  }
}

// @ DESC GET A SPECEFIC week
// @ ROUTE /api/weeks/bootcampId/:weekId
//@ access Protected/Admin, Mentor and Student
exports.view = async (req, res) => {
  const { id } = req.params
  try {
    const serviceCategory = await ServiceCategory.findById(id).populate(
      'ServiceCategoryedUser',
      'name email _id'
    )

    if (!serviceCategory) {
      return res.status(404).json({
        success: false,
        message: 'No serviceCategory found!'
      })
    }

    return res.status(201).json({ success: true, data: serviceCategory })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: 'Server Error' + error
    })
  }
}

//@ DESC UPDATE A week
// @ ROUTE /api/weeks/:bootcampId/:weekId
//@ access Protected/Admin and mentor
exports.update = async (req, res) => {
  try {
    const { id } = req.params

    const updatedServiceCategory = await ServiceCategory.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    )

    return res.status(200).json({
      success: true,
      data: updatedServiceCategory
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: error
    })
  }
}

//@ DESC DELETE A week
// @ ROUTE /api/weeks/:bootcampId/:weekId
//@ access Protected by Admin, mentor
exports.delete = async (req, res) => {
  try {
    const { id } = req.params

    //delete the week
    const serviceCategory = await ServiceCategory.deleteOne({ _id: id })

    res.status(200).json({
      success: true,
      message: serviceCategory.name + ' is deleted'
    })
  } catch (error) {
    console.log(error.message)
    res.status(500).json({
      message: error
    })
  }
}
