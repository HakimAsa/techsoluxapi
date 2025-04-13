const asyncHandler = require('express-async-handler')
const Joi = require('joi')
const JoiObjectId = require('joi-objectid')
const config = require('config')

const upload = require('../utils/upload')

const myJoiObjectId = JoiObjectId(Joi)

const bucket = config.get('AWS_S3_BUCKET')

//@desc upload an image
//@route POST api/v1/files/upload
//@access private
const uploadFile = asyncHandler(async (req, res) => {
  const singleUpload = upload(bucket).single('file')

  singleUpload(req, res, async function (err) {
    req.body.user = req.user._id

    if (!req.file) return res.status(400).send('No File has been selected')

    const { error } = validate(req.body)
    if (error) return res.status(400).send(error.details[0].message)

    if (err) {
      return res.json({
        success: false,
        errors: {
          title: 'Image Upload Error',
          detail: err.message,
          error: err,
        },
      })
    }
    res.status(201).send({
      message: 'File has been uploaded',
      imageUrl: req.file.location,
      fieldName: req.file.fieldname,
    })
  })

  // const { error } = validate(req.body);
  // if (error) return res.status(400).send(error.details[0].message);
})

//@desc upload a multiple images
//@route POST api/v1/files/uploads
//@access private
const uploadFiles = asyncHandler(async (req, res) => {
  const multipleFiles = upload(bucket).array(
    'files',
    config.get('max_file_length')
  )
  multipleFiles(req, res, async function (err) {
    req.body.user = req.user.id

    const { error } = validate(req.body)
    if (error) return res.status(400).send(error.details[0].message)

    if (!req.files) return res.status(400).send('No Files have been selected')
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        res.status(413).send({ error: 'Files too large' })
      } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        res
          .status(401)
          .send({ error: 'You are not allowed to upload more than 3 files' })
        // todo Handle other errors
      } else {
      }
    } else {
      const files = []
      req.files &&
        req.files.length &&
        req.files.forEach((file) => {
          files.unshift(file.location)
        })

      res.status(201).send({
        message: `${files.length} Files have been uploaded and Validated`,
        files,
      })
    }
  })
})

function validate(req, fieldName = 'files') {
  const schema = Joi.object({
    [fieldName]: Joi.string(),
    user: myJoiObjectId().required(),
  })
  return schema.validate(req)
}

module.exports = {
  uploadFile,
  uploadFiles,
}
