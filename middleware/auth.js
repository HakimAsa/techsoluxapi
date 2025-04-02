const asyncHandler = require('express-async-handler')
const jwt = require('jsonwebtoken')
const config = require('config')

const auth = asyncHandler(async function (req, res, next) {
  let token
  //Set token from Bearer token in header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  )
    token = req.headers.authorization.split(' ')[1]
  // Set token from cookie
  else if (req.cookies.token && req.headers['user-agent'])
    token = req.cookies.token
  // Set token from header
  else token = req.header('x-auth-token')
  if (!token) return res.status(401).send('Acces denied. No token provided.')

  try {
    const decoded = jwt.verify(token, config.get('jwtPrivateKey'))
    req.user = decoded //attach user to request
    next()
  } catch (error) {
    res.status(400).send({ message: 'Invalid token.', reason: error })
  }
})

module.exports = auth
