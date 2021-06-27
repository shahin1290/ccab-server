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

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  category: {
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

  price: {
    type: Number,
    required: true
  },
  
  instructors: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  students: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],

  published: {
    type: Boolean,
    default: false
  },

  info_list: [
    {
      title: {
        type: String
      },
      items: [
        {
          content: { type: String }
        }
      ]
    }
  ],

  createdAt: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model('Service', serviceSchema)
