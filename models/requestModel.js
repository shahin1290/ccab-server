const mongoose = require('mongoose')

const requestSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  amount: { type: Number, required: true },

  currency: { type: String, required: true },

  requestedUser: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },

  status: {
    type: String,
    default: 'Not Paid',
    enum: ['Not Paid', 'Paid']
  },

  expireAt: {
    type: Date,
    default: Date.now
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model('Request', requestSchema)
