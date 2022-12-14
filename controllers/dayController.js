const { validationResult } = require("express-validator");
const fs = require("fs");
const Day = require("../models/dayModel");
const Week = require("../models/weekModel");
const Bootcamp = require("../models/bootcampModel");
const MediaCenter = require("../models/mediaCenterModel");
const { checkIfStudentValid } = require("../util/checkStudentValidity");

//********** Validation Result ************
function getValidationResualt(req) {
  const error = validationResult(req);
  if (!error.isEmpty()) return error.array();
  return false;
}

//@ DESC GET All Days
//@ ROUTE /api/content/:weekId
//@ access Protected/Student
exports.getDays = async (req, res) => {
  const { weekId } = req.params;
  try {
    // check if the week 'show is true' return message the week is not upload it
    const week = await Week.findById(weekId).populate(
      "bootcamp",
      "mentor price"
    );

    if (!week) {
      return res.status(404).json({
        success: false,
        message: "No Week found!",
      });
    }

    let days;

    //check if the student is enrolled in the bootcamp
    if (req.user.user_type === "StudentUser") {
      const isValidStudent = await checkIfStudentValid(
        week.bootcamp,
        req.user._id
      );

      if (!isValidStudent && week.bootcamp.price > 0) {
        return res.status(404).json({
          success: false,
          message: "Student is not enrolled in this bootcamp",
        });
      }
      days = await Day.find({ week: req.params.weekId, show: true });
    }

    //check if is the mentor for the bootcamp
    if (req.user.user_type === "MentorUser") {
      if (!req.user._id.equals(week.bootcamp.mentor)) {
        return res.status(404).json({
          success: false,
          message: "You are not allowed mentor for this bootcamp",
        });
      }
      days = await Day.find({ week: req.params.weekId });
    }

    //check if is the mentor for the bootcamp
    if (req.user.user_type === "AdminUser") {
      days = await Day.find({ week: req.params.weekId });
    }

    if (days.lenght === 0) {
      return res.status(404).json({
        success: false,
        message: "No Day found!",
      });
    }

    return res.status(200).json({
      success: true,
      data: days,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: error,
    });
  }
};

//@ DESC GET All Days
//@ ROUTE /api/content/:weekId
//@ access Protected/Student
exports.getAllVideos = async (req, res) => {
  const { bootcampId } = req.params;
  try {
    const bootcamp = await Bootcamp.findById(bootcampId);

    const weeks = await Week.find({ bootcamp: bootcamp._id, show: true });

    let days = [];

    for (const week of weeks) {
      const foundDays = await Day.find({ week: week._id, show: true });
      days = [...days, ...foundDays];
    }

    if (days.lenght === 0) {
      return res.status(404).json({
        success: false,
        message: "No Day found!",
      });
    }

    return res.status(200).json({
      success: true,
      data: days,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: error,
    });
  }
};

//@ DESC POST A NEW day
//@ ROUTE /api/content/:weekId
//@ access Protected/Admin
exports.new = async (req, res) => {
  const errors = getValidationResualt(req);
  const video_file = req.files["video_path"][0];

  if (errors)
    //returning only first error allways
    return res.status(400).json({ success: false, message: errors[0].msg });

  try {
    // check if the week 'show is true' return message the week is not upload it
    const week = await Week.findById(req.params.weekId).populate(
      "bootcamp",
      "mentor"
    );

    if (!week) {
      return res.status(404).json({
        success: false,
        message: "No Week found!",
      });
    }

    //check if user is the mentor for the bootcamp
    if (
      req.user.user_type === "MentorUser" &&
      !req.user._id.equals(week.bootcamp.mentor)
    ) {
      return res.status(404).json({
        success: false,
        message: "You are not allowed mentor for this bootcamp",
      });
    }

    const { name, element_type, element_text } = req.body;

    let elementTextField;

    if (element_type === "image") {
      if (!req.files["element_text"]) {
        return res.status(404).json({
          success: false,
          message: "Please upload an image",
        });
      }
      elementTextField = req.files["element_text"][0].path;
    } else {
      elementTextField = element_text;
    }

    const newDay = new Day({
      week: week._id,
      name,
      video_path: video_file.path,
      source_code: [{ element_text: elementTextField, element_type }],
    });

    const day = await newDay.save();

    if (day)
      res.status(201).json({
        success: true,
        data: day,
      });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server Error" + error,
    });
  }
};

// @ DESC GET A SPECEFIC day
// @ ROUTE /api/content/:weekId/:id
//@ access Protected/Student
exports.view = async (req, res) => {
  const { weekId, id } = req.params;

  try {
    //check if the week exists
    const week = await Week.findById(weekId).populate(
      "bootcamp",
      "mentor price"
    );
    if (!week) {
      return res.status(404).json({
        success: false,
        message: "No Week found!",
      });
    }

    let day;

    //check if the student is enrolled in the bootcamp
    if (req.user.user_type === "StudentUser") {
      const isValidStudent = await checkIfStudentValid(
        week.bootcamp,
        req.user._id
      );

      if (!isValidStudent && week.bootcamp.price > 0) {
        return res.status(404).json({
          success: false,
          message: "Student is not enrolled in this bootcamp",
        });
      }
      day = await Day.findOne({ _id: id, show: true });
    }

    //check if is the mentor for the bootcamp
    if (req.user.user_type === "MentorUser") {
      if (!req.user._id.equals(week.bootcamp.mentor)) {
        return res.status(404).json({
          success: false,
          message: "You are not allowed mentor for this bootcamp",
        });
      }
      day = await Day.findOne({ _id: id });
    }

    //check if is the mentor for the bootcamp
    if (req.user.user_type === "AdminUser") {
      day = await Day.findOne({ _id: id });
    }

    if (!day) {
      return res.status(404).json({
        success: false,
        message: "No day found!",
      });
    }

    //check if the day is in the week

    if (!day.week.equals(weekId)) {
      return res.status(404).json({
        success: false,
        message: "The day is not found in that week",
      });
    }

    return res.status(200).json({
      success: true,
      data: day,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      message: "server Error" + error,
    });
  }
};

//@ DESC UPDATE A day
// @ ROUTE /api/content/:weedId/:id
//@ access Protected/Admin
exports.update = async (req, res) => {
  const errors = getValidationResualt(req);
  if (errors)
    //returning only first error allways
    return res.status(400).json({ success: false, message: errors[0].msg });

  try {
    const { weekId, id } = req.params;

    //check if the week exists
    const week = await Week.findById(weekId);
    if (!week) {
      return res.status(404).json({
        success: false,
        message: "No Week found!",
      });
    }

    /* //check if is the mentor for the bootcamp
    if (
      (req.user.user_type === 'MentorUser' ||
        req.user.user_type === 'AdminUser') &&
      !req.user._id.equals(week.bootcamp.mentor)
    ) {
      return res.status(404).json({
        success: false,
        message: 'You are not allowed mentor for this bootcamp'
      })
    } */

    //check if the day is in the week
    const day = await Day.findById(id);

    if (!day) {
      return res.status(404).json({
        success: false,
        message: "No day found!",
      });
    }

    if (!day.week.equals(weekId)) {
      return res.status(404).json({
        success: false,
        message: "The day is not found in that week",
      });
    }

    const source_code = [];

    if (req.body.title) {
      source_code.push({ element_type: "title", element_text: req.body.title });
    }

    if (req.body.description) {
      source_code.push({
        element_type: "description",
        element_text: req.body.description,
      });
    }

    if (
      req.files &&
      req.files["element_text"] &&
      req.files["element_text"][0].filename
    ) {
      source_code.push({
        element_type: "image",
        element_text: req.files["element_text"][0].filename,
      });
    }

    if (req.body.code) {
      source_code.push({ element_type: "code", element_text: req.body.code });
    }

    if (req.body.element_text) {
      source_code.push({
        element_type: "image",
        element_text: req.body.element_text,
      });
    }

    let sections;

    if (
      source_code.length &&
      day.sections.some((section) => section.name === req.body.section)
    ) {
      sections = day.sections.map((section) =>
        section.name !== req.body.section
          ? section
          : { name: req.body.title, source_code }
      );
    } else {
      sections = source_code.length
        ? [...day.sections, { name: req.body.title, source_code }]
        : [...day.sections];
    }

    let updatedObject;

    if (req.body.action === "delete") {
      updatedObject = {
        name: req.body.name,
        video_path: req.body.video_path,
        arabic_video_path: req.body.arabic_video_path,
        sections: req.body.sections,
      };
    } else
      updatedObject = {
        name: req.body.name,
        video_path:
          req.files && req.files["video_path"]
            ? req.files["video_path"][0].filename
            : req.body.video_path,
        arabic_video_path: req.body.arabic_video_path,
        sections,
        show: req.body.show,
      };

    //check the bootcamp exists
    const bootcamp = await Bootcamp.findById(week.bootcamp);

    const mediaCenter = await MediaCenter.findById(week.bootcamp);

    if (!bootcamp && !mediaCenter) {
      return res.status(404).json({
        success: false,
        message: "No Bootcamp found!",
      });
    }

    let updatedDay;

    if (bootcamp) {
      updatedDay = await Day.findByIdAndUpdate(day._id, updatedObject, {
        new: true,
      });
    }

    if (mediaCenter) {
      //update media center along with courses that links to it
      updatedDay = await Day.findByIdAndUpdate(day._id, updatedObject, {
        new: true,
      });

      if (mediaCenter.courses.length > 0) {
        for (course of mediaCenter.courses) {
          const bootcamp = await Bootcamp.findById(course);

          const bootcampWeek = await Week.findOne({
            name: week.name,
            bootcamp: bootcamp._id,
          });

          console.log('bootcampWeek',bootcampWeek);

          //create new quiz for the course
          const bootcampDay = await Day.findOne({
            name: day.name,
            week: bootcampWeek._id,
          });

          console.log('bootcampDay',bootcampDay);


          updatedDay = await Day.findByIdAndUpdate(
            bootcampDay._id,
            updatedObject,
            {
              new: true,
            }
          );
        }
      }
    }

    return res.status(200).json({
      success: true,
      data: updatedDay,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: error,
    });
  }
};

//@ DESC DELETE A day
// @ ROUTE /api/content/:weekId/days:id
//@ access Protected/Admin
exports.delete = async (req, res) => {
  const { weekId, id } = req.params;
  try {
    //check if the week exists
    const week = await Week.findById(weekId).populate("bootcamp", "mentor");
    if (!week) {
      return res.status(404).json({
        success: false,
        message: "No Week found!",
      });
    }

    //check if is the mentor for the bootcamp
    if (
      req.user.user_type === "MentorUser" &&
      !req.user._id.equals(week.bootcamp.mentor)
    ) {
      return res.status(404).json({
        success: false,
        message: "You are not allowed mentor for this bootcamp",
      });
    }

    //check if the day is in the week
    const day = await Day.findById(id);

    if (!day) {
      return res.status(404).json({
        success: false,
        message: "No day found!",
      });
    }

    if (!day.week.equals(weekId)) {
      return res.status(404).json({
        success: false,
        message: "The day is not found in that week",
      });
    }

    //delete the day
    await day.remove();

    //remove video from public folder
    fs.unlinkSync(day.video_path);

    //check if day contains any image reference
    const imageElemntArr = day.source_code.filter(
      (item) => item.element_type === "image"
    );

    //remove image from public folder
    if (imageElemntArr.length > 0) {
      imageElemntArr.forEach((el) => fs.unlinkSync(el.element_text));
    }

    res.status(200).json({
      success: true,
      message: day.name + " is deleted",
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      message: error,
    });
  }
};
