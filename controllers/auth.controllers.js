const asyncHandler = require('express-async-handler')
const config = require('config')

const { validate, User } = require('../models/user')

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
  sendTokenResponse(user, 201, res, 'User created successfully')
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

module.exports = { registerUser }
