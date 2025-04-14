const asyncHandler = require('express-async-handler')
const config = require('config')

const { Product } = require('../models/product.models')

// @desc Fetch all products
// @route GET /api/v1/products
// @access Public
const getProducts = asyncHandler(async (req, res) => {
  //Pagination
  const pageSize = config.get('pageSize')
  const page = Number(req.query.pageNumber) || 1

  //advanced filtering
  const keywords = req.query.keyword
    ? {
        name: {
          $regex: req.query.keyword,
          $options: 'gi',
        },
      }
    : {}

  const count = await Product.countDocuments({ ...keywords })

  const products = await Product.find({ ...keywords })
    .limit(pageSize)
    .skip(pageSize * (page - 1))
  res.send({
    success: true,
    page,
    pages: Math.ceil(count / pageSize),
    count,
    data: products,
  })
})

// @desc Get top rated products
// @route GET /api/v1/products/top
// @access Public
const getTopRatedProduct = asyncHandler(async (req, res) => {
  const products = await Product.find({})
    .sort({ reviewRates: -1 })
    .limit(config.get('top'))

  res.send({
    success: true,
    count: products.length,
    data: products,
  })
})

// @desc Create a product only by admin
// @route POST /api/products
// @access Private
const createProduct = asyncHandler(async (req, res) => {
  req.body.user = req.user._id
  // req.body.dimensions = `${req.body.pLength} x ${req.body.pWidth} x ${req.body.pHeight} inches`;

  // const { error } = validate(req.body);
  // if (error) return res.status(400).send(error.details[0].message);

  const product = await Product.create(req.body)
  res.status(201).send({ success: true, data: product })
})

module.exports = {
  createProduct,
  getProducts,
  getTopRatedProduct,
}
