const mongoose = require('mongoose')

// Admin can create these takes

const taskSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  bootcamp: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bootcamp',
    required: true
  },
  week: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Week',
    required: true
  },
  projectName: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  path: {
    type: String,
    required: true
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model('Task', taskSchema)
