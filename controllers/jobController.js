const { validationResult } = require("express-validator");
const Request = require("../models/jobModel");
const Job = require("../models/jobModel");

//********** Validation Result ************

//********** is email OR name exist ************
async function isEmailOrNameExist(email, name, id) {
  const jobs = await Job.find({
    $and: [{ $or: [{ email: email }, { name: name }] }, { _id: { $ne: id } }],
  });
  //console.log('inner func :',jobs);
  if (jobs.length) return jobs;
  return false;
}

//@ DESC GET weeks
//@ ROUTE /api/weeks/:bootcampId
//@ access Protected/Admin, Mentor and Student
exports.getJobs = async (req, res) => {
  try {
    const jobs = await Job.find({});

    if (jobs.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No Job found!",
      });
    }

    if (jobs.length > 0)
      return res.status(201).json({ success: true, data: jobs });
  } catch (error) {
    res.status(500).json({
      message: "Server Error" + error,
    });
  }
};

//@des GET Download assignment file
//@route GET  api/v2/tasks/:id/download
//@accesss Public

exports.downloadFile = async (req, res, next) => {
  try {
    //get the answer id
    const id = req.params.id;

    // get specific answer from db
    const job = await Job.findById(id);

    // check if answer is Not exist
    if (!job)
      return res
        .status(404)
        .json({ success: false, message: "File Not found" });

    console.log(job.cv_path);

    //download the PDF file
    return res.download(job.cv_path);
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, error: "Server Error : " + err });
  }
};

//@des GET Download assignment file
//@route GET  api/v2/tasks/:id/download
//@accesss Public

exports.downloadOthers = async (req, res, next) => {
  try {
    //get the answer id
    const id = req.params.id;

    // get specific answer from db
    const job = await Job.findById(id);

    // check if answer is Not exist
    if (!job)
      return res
        .status(404)
        .json({ success: false, message: "File Not found" });

    console.log(job.doc_path);

    //download the PDF file
    return res.download(job.doc_path);
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, error: "Server Error : " + err });
  }
};

//@ DESC POST A NEW week
//@ ROUTE /api/weeks/:bootcampId
//@ access Protected/Admin, Mentor
exports.new = async (req, res) => {
  const { name, email, phone, message, position } = req.body;

  // check if the name or email exist
  const EmailORNameExist = await isEmailOrNameExist(email, null, null);
  //console.log('EmailORNameExist : ',EmailORNameExist.length);

  //if true : return error
  if (EmailORNameExist.length)
    return res
      .status(400)
      .json({ success: false, message: "Email is already registered!" });

  try {
    const newJob = new Job({
      name,
      email,
      phone,
      message,
      position,
      cv_path:
        req.files && req.files["cv_path"] && req.files["cv_path"][0].path,

      doc_path:
        req.files && req.files["doc_path"] && req.files["doc_path"][0].path,
    });

    const job = await newJob.save();

    if (job) return res.status(201).json({ success: true, data: job });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server Error" + error,
    });
  }
};
