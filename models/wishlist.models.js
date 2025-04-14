const mongoose = require('mongoose')
const Joi = require('joi')
const JoiObjectId = require('joi-objectid')

const myJoiObjectId = JoiObjectId(Joi)

const Schema = mongoose.Schema

const wishlistSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    product: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Product',
    },
    liked: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
)

const Wishlist = mongoose.model('Wishlist', wishlistSchema)

function validateWishlist(wishlist, isRequired = true) {
  const schema = Joi.object({
    user: isRequired ? myJoiObjectId().required() : myJoiObjectId(),
    product: isRequired ? myJoiObjectId().required() : myJoiObjectId(),
    liked: Joi.boolean(),
  })
  return schema.validate(wishlist)
}

exports.Wishlist = Wishlist
exports.validate = validateWishlist
