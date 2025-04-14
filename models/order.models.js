const mongoose = require('mongoose')
const Joi = require('joi')
const JoiObjectId = require('joi-objectid')

const myJoiObjectId = JoiObjectId(Joi)

const Schema = mongoose.Schema

const orderSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    oderItems: [
      {
        name: { type: String, required: true },
        qty: { type: Number, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        product: {
          type: Schema.Types.ObjectId,
          required: true,
          ref: 'Product',
        },
      },
    ],
    shippingAddress: {
      address: { type: String, required: true },
      country: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    paymentResult: {
      id: String,
      status: String,
      update_time: String,
      email_address: String,
    },
    taxPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    shippingPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    isPaid: {
      type: Boolean,
      required: true,
      default: false,
    },
    paidAt: Date,
    isDelivered: {
      type: Boolean,
      required: true,
      default: false,
    },
    deliveredAt: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
)

const Order = mongoose.model('Order', orderSchema)

function validateOrder(order, isRequired = true) {
  const schema = Joi.object({
    user: isRequired ? myJoiObjectId().required() : myJoiObjectId(),
    orderItem: Joi.array().items(
      Joi.object({
        name: Joi.string().required(),
        image: Joi.string().required(),
        qty: Joi.number().required().min(0),
        price: Joi.number().required().min(0),
        product: myJoiObjectId().required(),
        countInStock: Joi.number().required().min(0),
      })
    ),
    shippingAddress: isRequired
      ? Joi.object()
          .keys({
            address: Joi.string().required(),
            country: Joi.string().required(),
            city: Joi.string().required(),
            postalCode: Joi.string().required(),
          })
          .required()
      : Joi.object().keys({
          address: Joi.string(),
          country: Joi.string(),
          city: Joi.string(),
          postalCode: Joi.string(),
        }),
    paymentResult: Joi.object().keys({
      id: Joi.string(),
      status: Joi.string(),
      updatetime: Joi.string(),
      emailaddress: Joi.string(),
    }),
    paymentMethod: isRequired ? Joi.string().required() : Joi.string(),
    taxPrice: isRequired
      ? Joi.number().required().min(0.0)
      : Joi.number().min(0.0),
    shippingPrice: isRequired
      ? Joi.number().required().min(0.0)
      : Joi.number().min(0.0),
    totalprice: isRequired ? Joi.number().required() : Joi.number(),
    isdelivered: isRequired ? Joi.boolean().required() : Joi.boolean(),
    ispaid: isRequired ? Joi.boolean().required() : Joi.boolean(),
    paidat: Joi.date(),
    deliveredat: Joi.date(),
    itemsprice: Joi.number().min(0.0),
    //paypal check
    // [fld.ID]: Joi.string(),
    // [fld.INTENT]: Joi.string(),
    // [fld.STATUS]: Joi.string(),
    // [fld.STATUS]: Joi.string(),
    // [fld.PURCHASEUNITS]: Joi.array(),
    // [fld.PAYER]: Joi.object(),
    // [fld.CREATETIME]: Joi.date(),
    // [fld.UPDATETIME]: Joi.date(),
    // [fld.LINKS]: Joi.array(),
  })
  return schema.validate(order)
}

exports.Order = Order
exports.validate = validateOrder
