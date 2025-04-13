const mongoose = require('mongoose')

const Schema = mongoose.Schema

const reviewSchema = new Schema(
  {
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: CONS.STR_USER,
    },
  },
  { timestamps: true }
)

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    brand: {
      type: String,
      required: true,
    },
    shortDescription: {
      type: String,
      required: true,
    },
    longDescription: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    stock: {
      type: Number,
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    rating: {
      count: {
        type: Number,
        default: 0,
      },
      average: {
        type: Number,
        default: 0,
      },
    },
    category: String,
    color: String,
    size: String,
    colorVariation: [String],
    totalReviews: {
      type: Number,
      default: 0,
    },
    reviews: [reviewSchema],
  },
  { timestamps: true }
)

const Product = mongoose.model('Product', productSchema)
// const Review = mongoose.model('Review', reviewSchema)

exports.Product = Product
