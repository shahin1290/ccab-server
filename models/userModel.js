const mongoose = require('mongoose')

const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String
  },
  AccessUsers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  gender: { type: String,  enum: ['male', 'female', 'other'] },
  user_type: {
    type: String,
    require: true,
    default: 'StudentUser',
    enum: ['ViewerUser', 'StudentUser', 'MentorUser', 'AdminUser']
  },

  token: {
    type: String
  }
})

// decrype the password
// The purpose with that, is only keep code more clean and readble
userSchema.methods.verifyPassword = async function (typedPasswrod) {
  return await bcrypt.compare(typedPasswrod, this.password)
}

module.exports = mongoose.model('User', userSchema)
