const asyncHandler = require('express-async-handler')
const role = (roles) => {
  return asyncHandler(async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: Insufficient rights' })
    }
    next()
  })
}

module.exports = role
