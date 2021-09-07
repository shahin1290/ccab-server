const mongoose = require('mongoose')

const quizAnswerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz'
  },

  answers: [
    {
      question: { type: 'String' },
      answer: { type: 'String' }
    }
  ],

  status: {
    type: String,
    enum: [
      'Excellent',
      'Good',
      'Not Bad',
      'Failed',
      'Pending',
      'Sent',
      'Not Sent'
    ],
    default: 'Not Sent',
    required: true
  },

  quizTime: {
    type: String
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model('QuizAnswer', quizAnswerSchema)
