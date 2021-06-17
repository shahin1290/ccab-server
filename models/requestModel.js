const mongoose = require('mongoose')

const requestSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  amount: { type: Number, required: true },

  requestedUser: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },

  status: {
    type: String,
    default: 'Not Sent',
    enum: ['Not Sent', 'Sent', 'Not Paid', 'Paid']
  },

  paidAt: {
    type: Date
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model('Request', requestSchema)
