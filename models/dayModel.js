const mongoose = require('mongoose')

const daySchema = new mongoose.Schema({
  week: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Week'
  },

  name: {
    type: String,
    required: true
  },

  video_path: {
    type: String
  },
  arabic_video_path: {
    type: String
  },
  show: { type: Boolean, default: true },

  sections: [
    {
      name: { type: String, required: true },
      source_code: [
        {
          element_text: {
            type: String
          },
          element_type: {
            type: String,
            enum: ['title', 'description', 'image', 'code']
          }
        }
      ]
    }
  ],

  createdAt: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model('Day', daySchema)
