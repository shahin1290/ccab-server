const mongoose = require('mongoose')

const dailyActivitySchema = new mongoose.Schema({
  watchingLectures: [
    {
      lecture: { type: mongoose.Schema.Types.ObjectId, ref: 'Day' },
      endTimeInSeconds: { type: Number, default: 0 }
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
