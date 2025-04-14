const express = require('express')

const auth = require('../middleware/auth.js')
const {
  getProducts,
  getTopRatedProduct,
  createProduct,
} = require('../controllers/product.controllers.js')
const role = require('../middleware/role.js')

const router = express.Router()

router
  .route('/')
  .get(auth, getProducts)
  .post(auth, role(['admin']), createProduct)
router.get('/top', auth, getTopRatedProduct)

module.exports = router
