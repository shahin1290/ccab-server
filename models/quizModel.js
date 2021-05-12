const mongoose = require('mongoose')

const quizSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
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

  name: {
    type: String,
    required: true
  },

  description: {
    type: String,
    required: true
  },

  question: [
    {
      content: {
        type: String
      },
      answers: [
        {
          content: { type: String },
          correct: { type: Boolean }
        }
      ]
    }
  ],
  time: { type: Number, required: true },

  createdAt: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model('Quiz', quizSchema)
