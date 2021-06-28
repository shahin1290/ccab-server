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

const sessionSchema = new mongoose.Schema({
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service'
  },
  status: {
    type: String,
    require: true,
    default: 'Incomming',
    enum: ['Incomming', 'Not Reported', 'Reported']
  },

  // default start date is date.now .
  start_date: {
    type: Date,
    default: () => get_date(new Date()),
  },
  // default end date is after 1 hour from start date.
  end_date: {
    type: Date,
    default: () => get_date(new Date(Date.now() + 1000 * 60)),
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model('Session', sessionSchema)
