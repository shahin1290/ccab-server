const mongoose = require('mongoose')

const dailyActivitySchema = new mongoose.Schema({
  watchingLectures: [
    {
      lecture: { type: mongoose.Schema.Types.ObjectId, ref: 'Day' },
      week: { type: mongoose.Schema.Types.ObjectId, ref: 'Week' },
      duration: { type: Number, default: 0 },
      startDate: { type: Date, default: Date.now },
      endDate: { type: Date, default: Date.now }
    }
  ],

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

module.exports = mongoose.model('DailyActivity', dailyActivitySchema)
