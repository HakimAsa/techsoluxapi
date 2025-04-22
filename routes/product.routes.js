const express = require('express')

const auth = require('../middleware/auth.js')
const {
  getProducts,
  getTopRatedProduct,
  createProduct,
} = require('../controllers/product.controllers.js')
const role = require('../middleware/role.js')
const ep = require('../utils/endpoints.js')
const { doSetForwardslash: dsf } = require('../utils/global.js')

const router = express.Router()

router
  .route(ep.FORWARDSLASH)
  .get(auth, getProducts)
  .post(auth, role([ep.ADMIN]), createProduct)
router.get(dsf(ep.TOP), auth, getTopRatedProduct)

module.exports = router
