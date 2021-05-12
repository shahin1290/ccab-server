const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Bootcamp'
  },

  amount: { type: Number, required: true },
  charge: { type: String, required: true },

  orderBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },

  orderStatus: {
    type: String,
    default: 'Not Processed',
    enum: ['Not Processed', 'Processed']
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model('Order', orderSchema)