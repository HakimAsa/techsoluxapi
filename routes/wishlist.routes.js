const express = require('express')

const auth = require('../middleware/auth.js')
const {
  getWishlists,
  createWishlist,
  getUserWishlist,
} = require('../controllers/wishlist.controllers.js')

const router = express.Router()

router.route('/').get(auth, getWishlists).post(auth, createWishlist)
router.route('/userwishlists').get(auth, getUserWishlist)

module.exports = router
