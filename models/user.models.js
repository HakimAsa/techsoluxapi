const mongoose = require('mongoose')
const Joi = require('joi')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const config = require('config')
const bcrypt = require('bcryptjs')

const Schema = mongoose.Schema

const userSchema = new Schema(
  {
    username: {
      type: String,
      minlength: 3,
      maxlength: 50,
    },
    email: {
      type: String,
      trim: true,
      //   lowercase: true,
      unique: true,
      sparse: true, // Allows multiple documents with null email
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    confirmpassword: {
      type: String,
      required: true,
      select: false,
      validate: {
        validator: function (value) {
          return this.password === value
        },
        message: 'Passwords do not match',
      },
    },
    role: {
      type: String,
      enum: ['admin', 'user'],
      default: 'user',
    },
    isactive: {
      type: Boolean,
      default: true,
    },
    avatar: {
      type: String,
      default: 'default.jpg',
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
)

// Custom validation: Ensure at least one of username or email is provided
userSchema.path('username').validate(function (value) {
  return value || this.email // One of them must be present
}, 'Either username or email is required.')

userSchema.path('email').validate(function (value) {
  return value || this.username
}, 'Either username or email is required.')

userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    {
      id: this._id,
      role: this.role,
      email: this.email,
      username: this.username,
    },
    config.get('jwtPrivateKey'),
    {
      expiresIn: config.get('jwtExpiresIn'),
    }
  )
  return token
}

userSchema.methods.generatePasswordResetToken = function () {
  const resetToken = crypto.randomBytes(20).toString('hex')
  //Hash token and set resetPassoword field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex')

  // set expire
  this.resetPasswordExpires = Date.now() + 3600000 // 1 hour
}

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password)
}

userSchema.pre('save', function (next) {
  if (!this.username && !this.email) {
    return next(new Error('Either username or email must be provided.'))
  }
  next()
})

const User = mongoose.model('User', userSchema)

function validateUser(user) {
  const schema = Joi.object({
    username: Joi.string().min(3).max(50),
    email: Joi.string().min(5).max(255).email(),
    password: Joi.string().min(8).max(255).required(),
    confirmpassword: Joi.when('password', {
      is: Joi.exist(),
      then: Joi.string()
        .equal(Joi.ref('password'))
        .required()
        .label('Confirm password')
        .messages({
          'any.only': '{{#label}} does not match',
        }),
      otherwise: Joi.string().optional(),
    }), // make sure password and confirmPassword match
    role: Joi.string().valid('admin', 'user').default('user'),
  }).or('email', 'username')
  return schema.validate(user)
}

exports.User = User
exports.validate = validateUser
