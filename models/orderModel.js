const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
  course: {
    type: String,
    required: true
  },

  amount: { type: Number, required: true },
  charge: { type: String, required: true },

  currency: { type: String, required: true },
  method: { type: String, required: true },

  orderBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },

  orderStatus: {
    type: String,
    default: 'Not Processed',
    enum: ['Not Processed', 'Processed', 'Verified', 'Delivered', 'Active', 'Canceled']
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model('Order', orderSchema)
