const asyncHandler = require('express-async-handler')
const config = require('config')
const bcrypt = require('bcryptjs')
const Joi = require('joi')
const JoiObjectId = require('joi-objectid')

const { validate, User } = require('../models/user.models')
const fourOfour = require('../utils/404')
const upload = require('../utils/upload')

const myJoiObjectId = JoiObjectId(Joi)

const bucket = config.get('AWS_S3_BUCKET')

// @desc get Me
// @route POST /api/v1/auth/me
// @access Private
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)

  if (!user) return res.status(404).send({ message: 'User not found' })
  return res.status(200).send({ success: true, data: user })
})

// @desc update user details
// @route PUT /api/auth/updatedetails
// @access Private
const updateDetails = asyncHandler(async (req, res) => {
  let user = await User.findById(req.user._id).exec()
  if (!user) return res.status(404).send('user not found!')

  // const { error } = validate(req.body, false)
  const salt = await bcrypt.genSalt(10)

  const fieldToUpdate = {
    email: req.body.email ? req.body.email : user.email,
    contact: req.body.contact ? req.body.contact : user.contact,

    address: req.body.address ? req.body.address : user.address,
    username: req.body.username ? req.body.username : user.username,
    password: req.body.password && (await bcrypt.hash(req.body.password, salt)),
    bankdetails: req.body.bankdetails || user.bankdetails,
    businessaddress: req.body.businessaddress || user.businessaddress,
  }

  // if (error) return res.status(400).send(error.details[0].message) //todo

  user = await User.findByIdAndUpdate(req.user._id, fieldToUpdate, {
    new: true,
    runValidators: true,
  })
  if (!user) return res.status(404).send(fourOfour('User not found'))

  res.status(200).send(user)
})

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
    if (email && user.email === email)
      return res
        .status(400)
        .send({ success: false, message: 'Email already exists.' })
    if (username && user.username === username)
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

// @desc update password
// @route PUT /api/v1/auth/updatepassword
// @access Private
const updatePassword = asyncHandler(async (req, res) => {
  // validate request body
  const { error } = validateOnPasswordUpdate(req.body)
  if (error)
    return res
      .status(400)
      .send({ success: false, message: error.details[0].message })
  const user = await User.findById(req.user._id).select('+password')
  //Check current password
  if (!(await user.matchPassword(req.body.currentpassword)))
    return res.status(401).send('Password is incorrect!')
  // hash password in body request
  const salt = await bcrypt.genSalt(10)
  user.password = await bcrypt.hash(req.body.newpassword, salt)

  //TODO AVOID NEWPASSWORD === CURRENTPASSWORD

  //saving user password to db
  await user.save()
  sendTokenResponse(user, 200, res)
  //res.send({ success: true, data: user });
})

// @desc Forgot password
// @route POST /api/v1/auth/forgotpassword
// @access Public for client
const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email })
  if (!user) return res.status(404).send(fourOfour(CONS.USER, req.body.email))

  // Get reset token
  const resetToken = user.getResetPasswordToken()
  await user.save({ validateBeforeSave: false })

  // Create reset url
  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/auth/resetpassword/${resetToken}`

  const message = `Your are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`
  const otp = `${Math.floor(10000 + Math.random() * 90000)}`
  try {
    await sendEmail({
      email: user.email,
      subject: 'Forgort Password reset token',

      message,
      html: `<p>Enter <b>${otp}</b> to continue`,
    })
    res.status(201).send({ success: true, data: 'Email sent' })
  } catch (err) {
    console.log(err)
    user.resetpasswordtoken = undefined
    user.resetpasswordexpires = undefined
    await user.save({ validateBeforeSave: false })

    return res.status(500).send('Email could not be sent!')
  }
})

// @desc Update Profile Picture
// @route PATCH /api/v1/auth/updateprofilepicture
// @access Private
const updateProfilePicture = asyncHandler(async (req, res) => {
  const singleUpload = upload(bucket).single('avatar')
  singleUpload(req, res, async function (err) {
    req.body.user = req.user._id

    if (!req.file) return res.status(400).send('No File has been selected')

    const { error } = validateAvatar(req.body)
    if (error) return res.status(400).send(error.details[0].message)

    if (err) {
      return res.json({
        success: false,
        errors: {
          title: 'Image Upload Error',
          detail: err.message,
          error: err,
        },
      })
    }
    const user = await User.findById(req.user._id)
    if (!user) return res.status(404).send({ message: 'User not found' })
    user.avatar = req.file.location
    await user.save()
    res.status(200).send({
      message: 'Avatar  has been updated successfully',
      avatar: req.file.location,
      fieldName: req.file.fieldname,
    })
  })
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
function validateOnPasswordUpdate(req) {
  const schema = {
    currentpassword: Joi.string().min(8).max(30).required(),
    newpassword: Joi.string().min(8).max(30).required(),
  }
  return schema.validate(req)
}
function validateAvatar(req, fieldName = 'avatar') {
  const schema = Joi.object({
    [fieldName]: Joi.string(),
    user: myJoiObjectId().required(),
  })
  return schema.validate(req)
}
module.exports = {
  authUser,
  forgotPassword,
  getMe,
  logout,
  registerUser,
  updatePassword,
  updateProfilePicture,
  updateDetails,
}
