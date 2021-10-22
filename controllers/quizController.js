const { validationResult } = require("express-validator");
const Quiz = require("../models/quizModel");
const QuizAnswer = require("../models/quizAnswerModel");
const Bootcamp = require("../models/bootcampModel");
const MediaCenter = require("../models/mediaCenterModel");
const User = require("../models/userModel");
const Day = require("../models/dayModel");
const Week = require("../models/weekModel");

const { checkIfStudentValid } = require("../util/checkStudentValidity");
const fs = require("fs");
const { sendMail } = require("../middleware/sendMail");

//********** Functions ************************************

//********** validation Resault ************

function getValidationResult(req) {
  const error = validationResult(req);
  if (!error.isEmpty()) return error.array();
  return false;
}

//********** is Name exist ************
const isNameExist = async (quizName) => {
  const quiz = await Quiz.find({ name: quizName });
  if (quiz.length) {
    return true;
  }
  return false;
};

//********** Functions End************************************

//********** default route ************
//@des Get all quizzes for specific account
//@route Get api/quizzes/:bootcampId
//@accesss private (allow for bootcamp students, mentor and admin)

exports.getAllQuizzes = async (req, res, next) => {
  try {
    const { bootcampId } = req.params;

    //check the bootcamp exists
    const bootcamp = await Bootcamp.findById(bootcampId);

    const mediaCenter = await MediaCenter.findById(bootcampId);

    if (!bootcamp && !mediaCenter) {
      return res.status(404).json({
        success: false,
        message: "No Bootcamp found!",
      });
    }
    let quizzes;

    //check if the student is enrolled in the bootcamp
    if (req.user.user_type === "StudentUser") {
      const isValidStudent = await checkIfStudentValid(bootcamp, req.user._id);

      if (!isValidStudent && Number(bootcamp.price) > 0) {
        return res.status(404).json({
          success: false,
          message: "Student is not enrolled in this bootcamp",
        });
      }

      quizzes = await Quiz.find(
        { bootcamp: bootcampId },
        "name description question.content"
      );
    }

    //check if is the mentor for the bootcamp
    if (req.user.user_type === "MentorUser") {
      if (!req.user._id.equals(bootcamp.mentor)) {
        return res.status(404).json({
          success: false,
          message: "You are not allowed mentor for this bootcamp",
        });
      }
      quizzes = await Quiz.find({ bootcamp: bootcampId });
    }

    //check if is the mentor for the bootcamp
    if (req.user.user_type === "AdminUser") {
      quizzes = await Quiz.find({ bootcamp: bootcampId });
    }

    if (quizzes.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No quiz found!",
      });
    }

    return res.status(200).json({
      success: true,
      count: quizzes.length,
      data: quizzes,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, error: "Server Error" + err });
  }
};

//@des POST new quiz for specific account
//@route POST api/quiz
//@accesss private (allow for mentor and admin)
exports.newQuiz = async (req, res, next) => {
  const errors = getValidationResult(req);
  if (errors)
    //returning only first error allways
    return res.status(400).json({ success: false, message: errors[0].msg });

  try {
    const { bootcampId } = req.params;

    //check the bootcamp exists
    const bootcamp = await Bootcamp.findById(bootcampId);

    const mediaCenter = await MediaCenter.findById(bootcampId);

    if (!bootcamp && !mediaCenter) {
      return res.status(404).json({
        success: false,
        message: "No Bootcamp found!",
      });
    }

    //Check if mentor is assigned to the bootcamp
    if (
      req.user.user_type === "MentorUser" &&
      !req.user._id.equals(bootcamp.mentor)
    ) {
      return res.status(404).json({
        success: false,
        message: "You are not allowed mentor for this bootcamp",
      });
    }

    //check the day exists
    const day = await Day.findById(req.params.dayId).populate(
      "week",
      "name _id"
    );

    if (!day) {
      return res.status(404).json({
        success: false,
        message: "No Day found!",
      });
    }

    const { name, description, question, time } = req.body;
    const newQuiz = new Quiz({
      name,
      description,
      question,
      time,
      user: req.user._id,
      bootcamp: bootcampId,
      day: day._id,
    });

    await newQuiz.save();

    //find the quiz that is saved
    const savedQuiz = await Quiz.findOne({
      name,
      description,
      time,
      user: req.user._id,
      bootcamp: bootcampId,
      day: day._id,
    });

    if (bootcamp) {
      //create empty answers for each student of this bootcamp for that quiz
      for (student of bootcamp.students) {
        const user = await User.findOne(student._id);
        //craete the answers
        const quizAnswer = new QuizAnswer({
          user: user._id,
          quiz: savedQuiz._id,
        });

        await quizAnswer.save();

        //send email to the mentor (submited Answer) .............>
        const toUser = { email: user.email, name: user.name };
        const subjet = 'New Quiz:Was Created "' + savedQuiz.name + '" Quiz';
        const html = {
          student: "",
          text: "We want to inform you that a new quiz has been added ",
          assignment: " " + savedQuiz.name + " Quiz.<br>",
          link: "https://ccab.tech/quiz/" + savedQuiz._id,
        };

        var mailStatus = sendMail(res, toUser, subjet, html);
      }
    }

    if (mediaCenter && mediaCenter.courses.length > 0) {
      for (course of mediaCenter.courses) {
        const bootcamp = await Bootcamp.findById(course);

        const bootcampWeek = await Week.findOne({
          name: day.week.name,
          bootcamp: bootcamp._id,
        });

        //create new quiz for the course
        const bootcampDay = await Day.findOne({
          name: day.name,
          week: bootcampWeek._id,
        });

        const newQuiz = new Quiz({
          name,
          description,
          question,
          time,
          user: req.user._id,
          bootcamp: bootcamp._id,
          day: bootcampDay._id,
        });

        const savedQuiz = await newQuiz.save();

        if (bootcamp.students.length > 0) {
          for (student of bootcamp.students) {
            const user = await User.findById(student);

            //craete the answers
            const quizAnswer = new QuizAnswer({
              user: user._id,
              quiz: savedQuiz._id,
            });

            const answerr = await quizAnswer.save();

            //send email to the mentor (submited Answer) .............>
            const toUser = { email: user.email, name: user.name };
            const subjet = 'New Quiz:Was Created "' + savedQuiz.name + '" Quiz';
            const html = {
              student: "",
              text: "We want to inform you that a new quiz has been added ",
              assignment: " " + savedQuiz.name + " Quiz.<br>",
              link: "https://ccab.tech/quiz/" + savedQuiz._id,
            };

            var mailStatus = sendMail(res, toUser, subjet, html);
          }
        }
      }
    }

    return res.status(201).json({ success: true, data: savedQuiz });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server Error" + error,
    });
  }
};

//@des GET single quiz for specific account
//@route GET api/quiz/:id
//@accesss private (allow for Admin, mentor, student)
exports.quizDetails = async (req, res) => {
  try {
    const { bootcampId } = req.params;

    //check the bootcamp exists
    const bootcamp = await Bootcamp.findById(bootcampId);

    const mediaCenter = await MediaCenter.findById(bootcampId);

    if (!bootcamp && !mediaCenter) {
      return res.status(404).json({
        success: false,
        message: "No Bootcamp found!",
      });
    }

    //check if the student is enrolled in the bootcamp
    if (req.user.user_type === "StudentUser") {
      const isValidStudent = await checkIfStudentValid(bootcamp, req.user._id);

      if (!isValidStudent) {
        return res.status(404).json({
          success: false,
          message: "Student is not enrolled in this bootcamp",
        });
      }
    }

    //Check if mentor is assigned to the bootcamp
    if (
      req.user.user_type === "MentorUser" &&
      !req.user._id.equals(bootcamp.mentor)
    ) {
      return res.status(404).json({
        success: false,
        message: "You are not allowed mentor for this bootcamp",
      });
    }

    //check the day exists
    const day = await Day.findById(req.params.dayId);

    if (!day) {
      return res.status(404).json({
        success: false,
        message: "No day found!",
      });
    }

    const quiz = await Quiz.findOne(
      {
        _id: req.params.id,
        bootcamp: bootcampId,
        day: day._id,
      },
      "createdAt name description time question.content question.answers"
    );

    if (!quiz) {
      return res
        .status(404)
        .json({ success: false, message: "quiz is not found" });
    }
    return res.status(200).json({
      success: true,
      data: quiz,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, error: "Server error: " + err });
  }
};

//@des PUT Update single quiz for specific account
//@route PUT api/quiz/:id
//@accesss private (allow for Admin, mentor)
exports.updateQuiz = async function (req, res) {
  try {
    const { bootcampId } = req.params;

    //check the bootcamp exists
    const bootcamp = await Bootcamp.findById(bootcampId);

    const mediaCenter = await MediaCenter.findById(bootcampId);

    if (!bootcamp && !mediaCenter) {
      return res.status(404).json({
        success: false,
        message: "No Bootcamp found!",
      });
    }

    //Check if mentor is assigned to the bootcamp
    if (
      req.user.user_type === "MentorUser" &&
      !req.user._id.equals(bootcamp.mentor)
    ) {
      return res.status(404).json({
        success: false,
        message: "You are not allowed mentor for this bootcamp",
      });
    }

    const updatedQuiz = await Quiz.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user._id,
        bootcamp: bootcampId,
      },
      req.body,
      {
        new: true,
      }
    );

    return res.status(200).json({
      success: true,
      data: updatedQuiz,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, error: "Server Error : " + err });
  }
};

//@des DELETE single quiz for specific account
//@route DELETE api/quiz/:id
//@accesss private (allow for Admin, mentor)
exports.deleteQuiz = async function (req, res) {
  try {
    const { bootcampId } = req.params;

    //check the bootcamp exists
    const bootcamp = await Bootcamp.findById(bootcampId);

    const mediaCenter = await MediaCenter.findById(bootcampId);

    if (!bootcamp && !mediaCenter) {
      return res.status(404).json({
        success: false,
        message: "No Bootcamp found!",
      });
    }

    //Check if mentor is assigned to the bootcamp
    if (
      req.user.user_type === "MentorUser" &&
      !req.user._id.equals(bootcamp.mentor)
    ) {
      return res.status(404).json({
        success: false,
        message: "You are not allowed mentor for this bootcamp",
      });
    }

    //check the day exists
    const day = await Day.findById(req.params.dayId);

    if (!day) {
      return res.status(404).json({
        success: false,
        message: "No day found!",
      });
    }

    const quiz = await Quiz.findOne({
      _id: req.params.id,
      user: req.user._id,
      bootcamp: bootcampId,
      day: day._id,
    });

    if (!quiz) {
      return res.status(404).json({
        message: "Quiz Doesn't  Exist ",
      });
    }

    await quiz.deleteOne();

    await QuizAnswer.deleteMany({ quiz });

    return res.status(200).json({
      data: null,
      message: "Quiz hase been deleted",
      success: true,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, error: "Server Error : " + err });
  }
};

exports.studentQuizzes = async (req, res) => {
  try {
    const enrolledBootcamps = await Bootcamp.find({ students: req.user._id });

    const studentQuizzes = await Quiz.find(
      { bootcamp: { $in: enrolledBootcamps } },
      function (err, result) {
        result.map(function (document) {
          return document.value;
        });
      }
    )
      .populate("user", "name email")
      .populate("bootcamp", "name");

    if (!studentQuizzes.length) {
      return res.status(404).json({
        success: false,
        message: "You don't have any Quiz yet.",
      });
    }

    return res.status(200).json({
      success: true,
      data: studentQuizzes,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Server error: " + error.message,
    });
  }
};
