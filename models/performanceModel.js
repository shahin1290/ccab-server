const mongoose = require('mongoose')

const performanceSchema = new mongoose.Schema({
  watchingLectures: [
    {
      lecture: { type: mongoose.Schema.Types.ObjectId, ref: 'Day' },
      course: { type: mongoose.Schema.Types.ObjectId, ref: 'Bootcamp' }
    }
  ],

  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model('Performance', performanceSchema)
