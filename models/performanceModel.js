const mongoose = require('mongoose')

// to get the
const get_date = (date) => {
  const month = date.getMonth()
  const day = date.getDate()
  const year = date.getFullYear()
  let fulldate = year

  if (month < 10) fulldate += `-0${month + 1}-`
  else fulldate += `-${month + 1}-`
  if (day < 10) fulldate += `0${day}`
  else fulldate += `${day}`
  return fulldate
}

const performanceSchema = new mongoose.Schema({
  watchingLectures: [
    {
      lecture: { type: mongoose.Schema.Types.ObjectId, ref: 'Day' },
      course: { type: mongoose.Schema.Types.ObjectId, ref: 'Bootcamp' }
    }
  ],

  watchingLectureScore: { type: Number, default: 0 },

  submittedTask: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  },

  submittedTaskScore: { type: Number, default: 0 },

  taskResultScore: { type: Number, default: 0 },

  submittedQuiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz'
  },

  submittedQuizScore: { type: Number, default: 0 },

  quizResultScore: { type: Number, default: 0 },

  onlineTimeSpent: { type: Number, default: 0 },

  online: { type: Date, default: Date.now },

  onlineScore: { type: Number, default: 0 },

  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  bootcamp: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bootcamp'
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model('Performance', performanceSchema)
