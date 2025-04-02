const express = require('express')

const {
  registerUser,
  authUser,
  logout,
} = require('../controllers/auth.controllers')
const auth = require('../middleware/auth')

const router = express.Router()

router.post('/register', registerUser)
router.post('/login', authUser)
router.get('/logout', auth, logout)

module.exports = router
