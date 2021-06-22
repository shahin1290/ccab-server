const mongoose = require('mongoose')

const jobSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },

  phone: {
    type: String
  },

  subject: {
    type: String,
    required: true
  },
  message: {
    type: String
  },
  cv_path: {
    type: String
  },
  doc_path: {
    type: String
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model('Job', jobSchema)
