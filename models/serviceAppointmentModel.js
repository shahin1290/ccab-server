const mongoose = require("mongoose");

const serviceAppointmentSchema = new mongoose.Schema({
  city: {
    type: String,
  },
  subjects: [{ type: String }],

  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },

  phone: {
    type: String,
    required: true,
  },

  helpingSubject: {
    type: String,
  },
  message: {
    type: String,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("ServiceAppointment", serviceAppointmentSchema);
