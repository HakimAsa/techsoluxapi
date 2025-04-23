const asyncHandler = require('express-async-handler')
const config = require('config')

const { Wishlist, validate } = require('../models/wishlist.models')

const getUserWishlist = asyncHandler(async (req, res) => {
  try {
    const wishlist = await Wishlist.find({
      user: req.user?._id,
      liked: true,
    }).populate('product')
    // Filter unique products by _id
    const uniqueProductsMap = new Map()
    wishlist.forEach((item) => {
      const product = item.product
      if (!product) return // safety check

      const id = product._id.toString()
      if (!uniqueProductsMap.has(id)) {
        /* clone the product (to avoid mutating the Mongoose doc),
           then add any extra fields you want to expose */
        uniqueProductsMap.set(id, {
          ...product.toObject({ getters: true, virtuals: false }),
          liked: true, // <-- attach the flag
        })
      }
    })
    // 3. Convert the Map back to an array and return it
    const uniqueProducts = [...uniqueProductsMap.values()]

    return res.json(uniqueProducts)

    // res.json(products) // You can also return `wishlist` if you want more control
  } catch (error) {
    console.error('Error fetching wishlist:', error)
    res.status(500).json({ message: 'Server error while fetching wishlist' })
  }
})

// @desc Fetch all wishlists
// @route GET /api/v1/wishlists
// @access Public
const getWishlists = asyncHandler(async (req, res) => {
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

  const count = await Wishlist.countDocuments({ ...keywords })

  const products = await Wishlist.find({ ...keywords })
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

// @desc Create a wishlist
// @route POST /api/v1/wishlist
// @access Private
const createWishlist = asyncHandler(async (req, res) => {
  req.body.user = req.user._id

  const { error } = validate(req.body)
  if (error) return res.status(400).send(error.details[0].message)

  const product = await Wishlist.create(req.body)
  res.status(201).send({ success: true, data: product })
})

module.exports = {
  createWishlist,
  getUserWishlist,
  getWishlists,
}
