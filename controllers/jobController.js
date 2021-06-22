const { validationResult } = require('express-validator')
const Request = require('../models/jobModel')
const Job = require('../models/jobModel')

//********** Validation Result ************

function getValidationResualt(req) {
  const error = validationResult(req)
  if (!error.isEmpty()) return error.array()
  return false
}

//@ DESC GET weeks
//@ ROUTE /api/weeks/:bootcampId
//@ access Protected/Admin, Mentor and Student
exports.getJobs = async (req, res) => {
  try {
    const jobs = await Job.find({})

    if (jobs.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No Job found!'
      })
    }

    if (jobs.length > 0)
      return res.status(201).json({ success: true, data: jobs })
  } catch (error) {
    res.status(500).json({
      message: 'Server Error' + error
    })
  }
}

//@des GET Download assignment file
//@route GET  api/v2/tasks/:id/download
//@accesss Public

exports.downloadFile = async (req, res, next) => {
  try {
    //get the answer id
    const id = req.params.id

    // get specific answer from db
    const job = await Job.findById(id)

    // check if answer is Not exist
    if (!job)
      return res.status(404).json({ success: false, message: 'File Not found' })

      console.log(job.cv_path);


    //download the PDF file
    return res.download(job.cv_path)
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, error: 'Server Error : ' + err })
  }
}

//@des GET Download assignment file
//@route GET  api/v2/tasks/:id/download
//@accesss Public

exports.downloadOthers = async (req, res, next) => {
  try {
    //get the answer id
    const id = req.params.id

    // get specific answer from db
    const job = await Job.findById(id)

    // check if answer is Not exist
    if (!job)
      return res.status(404).json({ success: false, message: 'File Not found' })

      console.log(job.doc_path);

    //download the PDF file
    return res.download(job.doc_path)
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, error: 'Server Error : ' + err })
  }
}


//@ DESC POST A NEW week
//@ ROUTE /api/weeks/:bootcampId
//@ access Protected/Admin, Mentor
exports.new = async (req, res) => {
  const { name, email, phone, message, subject } = req.body
  try {
    const newJob = new Job({
      name,
      email,
      phone,
      message,
      subject,
      cv_path:
        req.files && req.files['cv_path'] && req.files['cv_path'][0].path,

      doc_path:
        req.files && req.files['doc_path'] && req.files['doc_path'][0].path
    })

    const job = await newJob.save()

    if (job) return res.status(201).json({ success: true, data: job })
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
    const request = await Request.findById(id).populate(
      'requestedUser',
      'name email _id'
    )

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'No request found!'
      })
    }

    return res.status(201).json({ success: true, data: request })
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

    const updatedRequest = await Request.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    })

    return res.status(200).json({
      success: true,
      data: updatedRequest
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
    const request = await Request.deleteOne({ _id: id })

    res.status(200).json({
      success: true,
      message: request.name + ' is deleted'
    })
  } catch (error) {
    console.log(error.message)
    res.status(500).json({
      message: error
    })
  }
}
