const mongoose = require('mongoose')
const crypto = require('crypto');
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

  AccessUsers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  gender: { type: String, enum: ['male', 'female', 'others'] },

  education: {
    type: String
  },
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

  stripeCustomerId: {
    type: String
  },

  passwordChangedAt: {
    type: Date,
  },
  passwordResetToken: {
    type: String,
  },
  passwordResetExpires: {type: Date},
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

userSchema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});


userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};


module.exports = mongoose.model('User', userSchema)
