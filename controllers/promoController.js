const { validationResult } = require("express-validator");
const Promo = require("../models/promoModel");
const User = require("../models/userModel");

//********** Validation Result ************

function getValidationResualt(req) {
  const error = validationResult(req);
  if (!error.isEmpty()) return error.array();
  return false;
}

//@ DESC GET weeks
//@ ROUTE /api/weeks/:bootcampId
//@ access Protected/Admin, Mentor and Student
exports.getPromos = async (req, res) => {
  try {
    let promos = await Promo.find({});

    if (promos.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No Promo  found!",
      });
    }

    if (promos.length)
      return res.status(201).json({ success: true, data: promos });
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
  const { days, hours, minutes, name, percentages } = req.body;
  try {
    const newPromo = new Promo({
      name,
      days,
      hours,
      minutes,
      percentages,
    });

    const promo = await newPromo.save();

    if (promo) return res.status(201).json({ success: true, data: promo });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server Error" + error,
    });
  }
};

// @ DESC GET A SPECEFIC week
// @ ROUTE /api/weeks/bootcampId/:weekId
//@ access Protected/Admin, Mentor and Student
exports.view = async (req, res) => {
  const { id } = req.params;
  try {
    const promo = await Promo.findById(id);

    if (!promo) {
      return res.status(404).json({
        success: false,
        message: "No Promo found!",
      });
    }

    return res.status(201).json({ success: true, data: promo });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server Error" + error,
    });
  }
};

//@ DESC UPDATE A week
// @ ROUTE /api/weeks/:bootcampId/:weekId
//@ access Protected/Admin and mentor
exports.update = async (req, res) => {
  try {
    const { id } = req.params;

    const { name, days, hours, minutes, percentages, show } = req.body;

    const updatedPromo = await Promo.findByIdAndUpdate(
      id,
      { name, days, hours, minutes, percentages, show, createdAt: Date.now() },
      {
        new: true,
        runValidators: true,
      }
    );

    return res.status(200).json({
      success: true,
      data: updatedPromo,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: error,
    });
  }
};

//@ DESC DELETE A week
// @ ROUTE /api/weeks/:bootcampId/:weekId
//@ access Protected by Admin, mentor
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    //delete the week
    const promo = await Promo.deleteOne({ _id: id });

    res.status(200).json({
      success: true,
      message: promo.name + " is deleted",
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      message: error,
    });
  }
};
