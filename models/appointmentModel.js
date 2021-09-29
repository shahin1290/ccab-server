const mongoose = require("mongoose");

// to get the
const get_date = (date) => {
  const month = date.getMonth();
  const day = date.getDate();
  const year = date.getFullYear();
  let fulldate = year;

  if (month < 10) fulldate += `-0${month + 1}-`;
  else fulldate += `-${month + 1}-`;
  if (day < 10) fulldate += `0${day}`;
  else fulldate += `${day}`;
  return fulldate;
};

const appointmentSchema = new mongoose.Schema({
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Service",
    required: true,
  },
  sessionNumber: {
    type: Number,
    required: true,
    default: 1,
  },
  sessions: [{ id: String, content: { type: Date } }],
  expired: {
    type: Boolean,
    require: true,
    default: "false",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Appointment", appointmentSchema);
