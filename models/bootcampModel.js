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

const bootcampSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  img_path: {
    type: String,
    required: true
  },
  video_path: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  seats: {
    type: Number,
    required: true
  },
  mentor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  students: [
    {
     
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      
    }
  ],

  weeks: {
    type: Number,
    required: true
  },
  published: {
    type: Boolean,
    default: false
  },

  // default start date is date.now .
  start_date: {
    type: Date,
    default: () => get_date(new Date()),
    required: true,
    max: this.end_date
  },

  info_list: [
    {
      title: {
        type: String
      },
      items: [
        {
          content: { type: String },
        }
      ]
    }
  ],
  // default end date is after 1 day from start date.
  end_date: {
    type: Date,
    default: () => get_date(new Date(Date.now() + 1000 * 60 * 60 * 24)),
    required: true,
    min: this.start_date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model('Bootcamp', bootcampSchema)

module.exports.getDate = (date) => {
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
