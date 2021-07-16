const mongoose = require('mongoose')

const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },

  language: {
    type: String
  },

  password: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String
  },
  avatar: {
    type: String
  },

  networkAddresses: [
    {
      network: { type: String },
      address: { type: String }
    }
  ],
  bio: {
    type: String
  },
  skills: [{ type: String }],
  teachingFields: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServiceCategory'
    }
  ],
  AccessUsers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  gender: { type: String, enum: ['male', 'female', 'other'] },
  user_type: {
    type: String,
    require: true,
    default: 'StudentUser',
    enum: [
      'ViewerUser',
      'StudentUser',
      'MentorUser',
      'AdminUser',
      'InstructorUser',
      'AccountantUser'
    ]
  },

  token: {
    type: String
  },

  status: { type: String, enum: ['online', 'offline'] },

  createdAt: {
    type: Date,
    default: Date.now
  }
})

// decrype the password
// The purpose with that, is only keep code more clean and readble
userSchema.methods.verifyPassword = async function (typedPasswrod) {
  return await bcrypt.compare(typedPasswrod, this.password)
}

module.exports = mongoose.model('User', userSchema)
