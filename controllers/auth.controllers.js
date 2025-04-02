const asyncHandler = require('express-async-handler')
const config = require('config')
const bcrypt = require('bcryptjs')
const Joi = require('joi')

const { validate, User } = require('../models/user.models')

// @desc register a user
// @route POST /api/v1/auth/register
// @access public
const registerUser = asyncHandler(async (req, res) => {
  const { error } = validate(req.body)

  if (error)
    return res
      .status(400)
      .send({ success: false, message: error.details[0].message })

  const { username, email, password, role } = req.body
  const user = await User.findOne({ $or: [{ email }, { username }] })
  if (user) {
    if (user.email === email)
      return res
        .status(400)
        .send({ success: false, message: 'Email already exists.' })
    if (user.username === username)
      return res
        .status(400)
        .send({ success: false, message: 'Username already exists.' })
  }
  // hashing the password
  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash(password, salt)
  // create a new user instance
  const newUser = new User({
    username,
    email,
    password: hashedPassword,
    confirmpassword: hashedPassword,
    role,
  })
  await newUser.save()
  sendTokenResponse(newUser, 201, res, 'User created successfully')
})

// @desc login a user
// @route POST /api/v1/auth/login
// @access Public
const authUser = asyncHandler(async (req, res) => {
  // validate request body
  const { error } = validateOnLogin(req.body)
  if (error)
    return res
      .status(400)
      .send({ success: false, message: error.details[0].message })

  const { email, password, username } = req.body
  // check if user exists and password matches
  const user = await User.findOne({ $or: [{ email }, { username }] }).select(
    '+password'
  )
  if (!user || !(await user.matchPassword(password))) {
    return res
      .status(400)
      .send({ success: false, message: 'Invalid credentials' })
  }
  // send token response
  sendTokenResponse(user, 200, res)
})

// @desc   Logout user and clear cookie
// @route  GET /api/v1/auth/logout
// @access Private
const logout = asyncHandler(async (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0), // Immediately expires the cookie
    secure: process.env.NODE_ENV === 'production', // Ensures secure cookies in production
    sameSite: 'Strict', // Helps prevent CSRF attacks
  })

  res.status(200).json({ success: true, message: 'Logged out successfully' })
})

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res, message) => {
  const token = user.generateAuthToken()
  const exp = Date.now() + config.get('jwtCookieExpire') * 24 * 60 * 60 * 1000
  const options = {
    expires: new Date(exp),
    httpOnly: true,
    sameSite: 'Strict', // Helps prevent CSRF attacks
  }

  if (process.env.NODE_ENV === 'production') {
    options.secure = true
  }

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token_type: 'Bearer',
      message: message || 'successfully authenticated',
      token,
      expiresIn: exp,
    })
}
function validateOnLogin(req) {
  const schema = Joi.object({
    email: Joi.string().min(5).max(255).email(),
    username: Joi.string().min(3).max(30),
    password: Joi.string().min(5).max(30).required(), //min password = 8
  }).or('username', 'email')
  return schema.validate(req)
}
module.exports = { authUser, logout, registerUser }
