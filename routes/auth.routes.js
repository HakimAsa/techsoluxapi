const express = require('express')

const {
  registerUser,
  authUser,
  logout,
  updateProfilePicture,
  getMe,
  updateDetails,
} = require('../controllers/auth.controllers')
const auth = require('../middleware/auth')

const router = express.Router()

router.post('/register', registerUser)
router.post('/login', authUser)
router.get('/logout', auth, logout)
router.get('/me', auth, getMe)
router.patch('/updateprofilepicture', auth, updateProfilePicture)
router.put('/updatedetails', auth, updateDetails)

module.exports = router
