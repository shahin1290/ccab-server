const mongoose = require('mongoose')

const weekSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  bootcamp: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Bootcamp'
  },
  show: { type: Boolean, default: false },

  days: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Day'
    }
  ]
})

module.exports = mongoose.model('Week', weekSchema)
