const mongoose = require('mongoose')

const mediaCenterSchema = new mongoose.Schema({
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
  courses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bootcamp'
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

module.exports = mongoose.model('MediaCenter', mediaCenterSchema)
